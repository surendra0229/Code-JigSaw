export interface SimulationStep {
  stepNumber: number;
  lineId: string;
  lineNumber: number; // 1-indexed position in code
  code: string;
  variables: Record<string, any>;
  output: string;
  explanation: string;
}

export interface SimulationResult {
  supported: boolean;
  language: string;
  message?: string;
  steps: SimulationStep[];
}

/**
 * Generates execution simulation trace for supported languages (Python & JavaScript).
 */
export const generateCodeSimulation = (language: string, lines: { id: string; code: string }[]): SimulationResult => {
  const normLang = language.toLowerCase();
  
  if (normLang !== 'javascript' && normLang !== 'typescript' && normLang !== 'python') {
    return {
      supported: false,
      language,
      message: `Step-by-step code simulation is currently available for Python, JavaScript, and TypeScript.`,
      steps: []
    };
  }

  const steps: SimulationStep[] = [];
  const scope: Record<string, any> = {};
  let currentOutput = '';
  let stepIndex = 1;

  lines.forEach((lineObj, idx) => {
    const rawCode = lineObj.code.trim();
    const currentLineNum = idx + 1;
    let stepExplanation = `Executing line ${currentLineNum}: "${rawCode}"`;

    // Simple variable assignment parsing
    // JS/TS: let x = 10; const name = "Alice";
    // Python: x = 10, total = a + b
    const varAssignMatch = rawCode.match(/^(?:let|const|var)?\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.+?);?$/);
    
    if (varAssignMatch) {
      const varName = varAssignMatch[1];
      const varExpr = varAssignMatch[2].trim();

      // Evaluate expression with existing scope values
      try {
        let evaluatedValue: any = varExpr;
        if (!isNaN(Number(varExpr))) {
          evaluatedValue = Number(varExpr);
        } else if ((varExpr.startsWith('"') && varExpr.endsWith('"')) || (varExpr.startsWith("'") && varExpr.endsWith("'"))) {
          evaluatedValue = varExpr.slice(1, -1);
        } else if (varExpr.includes('+') || varExpr.includes('-') || varExpr.includes('*')) {
          // Simple arithmetic evaluator using current scope
          let exprCopy = varExpr;
          Object.keys(scope).forEach(k => {
            const regex = new RegExp(`\\b${k}\\b`, 'g');
            exprCopy = exprCopy.replace(regex, JSON.stringify(scope[k]));
          });
          try {
            // eslint-disable-next-line no-eval
            evaluatedValue = Function(`"use strict"; return (${exprCopy})`)();
          } catch {
            evaluatedValue = varExpr;
          }
        }

        scope[varName] = evaluatedValue;
        stepExplanation = `Assigned ${JSON.stringify(evaluatedValue)} to variable '${varName}'`;
      } catch {
        scope[varName] = varExpr;
      }
    } 
    // Print / console log
    else if (rawCode.includes('print(') || rawCode.includes('console.log(')) {
      let printContent = rawCode;
      const match = rawCode.match(/(?:print|console\.log)\((.*)\)/);
      if (match) {
        let expr = match[1].trim();
        if (scope[expr] !== undefined) {
          printContent = String(scope[expr]);
        } else {
          printContent = expr.replace(/^['"]|['"]$/g, '');
        }
      }
      currentOutput = currentOutput ? `${currentOutput}\n${printContent}` : printContent;
      stepExplanation = `Output printed: "${printContent}"`;
    }

    steps.push({
      stepNumber: stepIndex++,
      lineId: lineObj.id,
      lineNumber: currentLineNum,
      code: lineObj.code,
      variables: { ...scope },
      output: currentOutput,
      explanation: stepExplanation
    });
  });

  return {
    supported: true,
    language,
    steps
  };
};
