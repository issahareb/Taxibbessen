import type { Request, RequestHandler } from "express";

type ValidationIssue = {
  path: PropertyKey[];
  message: string;
  code?: string;
};

type SchemaResult =
  | { success: true; data: unknown }
  | { success: false; error: { issues: ValidationIssue[] } };

type RequestSchema = {
  safeParse(input: unknown): SchemaResult;
};

type RequestTarget = "body" | "params" | "query";

function formatIssues(issues: ValidationIssue[]) {
  return issues.map((issue) => ({
    field: issue.path.length > 0 ? issue.path.map(String).join(".") : "request",
    message: issue.message,
    code: issue.code ?? "invalid_value",
  }));
}

function validateRequest(schema: RequestSchema, target: RequestTarget): RequestHandler {
  return (req, res, next): void => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      res.status(400).json({
        error: "Validation failed",
        details: formatIssues(result.error.issues),
      });
      return;
    }

    if (target === "body") {
      req.body = result.data;
    } else if (target === "params") {
      req.params = result.data as Request["params"];
    } else {
      Object.assign(req.query, result.data);
    }

    next();
  };
}

export const validateBody = (schema: RequestSchema): RequestHandler =>
  validateRequest(schema, "body");

export const validateParams = (schema: RequestSchema): RequestHandler =>
  validateRequest(schema, "params");

export const validateQuery = (schema: RequestSchema): RequestHandler =>
  validateRequest(schema, "query");
