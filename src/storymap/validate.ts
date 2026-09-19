// storymap schema import (json module)
import schema from "../../schema/storymap.schema.json" with { type: "json" };

/*	StoryMap data validation
	Validates storymap JSON against schema/storymap.schema.json and
	reports every error found. Runs at load time and in the
	scripts/validate-storymap.mjs CLI.
================================================== */

export interface StorymapError {
    path: string;
    message: string;
}

const SCHEMA: any = schema;

function typeMatches(value: any, type: string | string[]): boolean {
    const types = Array.isArray(type) ? type : [type];
    return types.some((t) => {
        switch (t) {
            case "object":
                return typeof value === "object" && value !== null && !Array.isArray(value);
            case "array":
                return Array.isArray(value);
            case "string":
                return typeof value === "string";
            case "number":
                return typeof value === "number" && !isNaN(value);
            case "integer":
                return typeof value === "number" && Number.isInteger(value);
            case "boolean":
                return typeof value === "boolean";
            case "null":
                return value === null;
            case "uri":
                return typeof value === "string";
            default:
                return true;
        }
    });
}

function validateAgainstSchema(value: any, schemaNode: any, path: string, errors: StorymapError[]) {
    if (!schemaNode || typeof schemaNode !== "object") return;

    // $ref / $defs
    if (schemaNode.$ref) {
        const refPath = schemaNode.$ref.replace(/^#\//, "").replace(/~1/g, "/").replace(/~0/g, "~");
        let node = SCHEMA;
        for (const part of refPath.split("/")) node = node[part];
        validateAgainstSchema(value, node, path, errors);
        return;
    }

    // type
    if (schemaNode.type) {
        if (!typeMatches(value, schemaNode.type)) {
            const expected = Array.isArray(schemaNode.type)
                ? schemaNode.type.join(" or ")
                : schemaNode.type;
            errors.push({
                path,
                message: `expected ${expected}, got ${value === null ? "null" : typeof value}`,
            });
            return;
        }
    }

    // enum
    if (schemaNode.enum && !schemaNode.enum.some((v: any) => v === value)) {
        errors.push({
            path,
            message: `must be one of ${schemaNode.enum.map((v: any) => JSON.stringify(v)).join(", ")}`,
        });
    }

    // numeric constraints
    if (typeof value === "number") {
        if (schemaNode.minimum !== undefined && value < schemaNode.minimum) {
            errors.push({ path, message: `must be >= ${schemaNode.minimum}` });
        }
        if (schemaNode.maximum !== undefined && value > schemaNode.maximum) {
            errors.push({ path, message: `must be <= ${schemaNode.maximum}` });
        }
    }

    // string constraints
    if (typeof value === "string") {
        if (schemaNode.minLength !== undefined && value.length < schemaNode.minLength) {
            errors.push({ path, message: `must be at least ${schemaNode.minLength} characters` });
        }
        if (schemaNode.pattern !== undefined && !new RegExp(schemaNode.pattern).test(value)) {
            errors.push({ path, message: `must match ${schemaNode.pattern}` });
        }
    }

    // array constraints
    if (Array.isArray(value)) {
        if (schemaNode.minItems !== undefined && value.length < schemaNode.minItems) {
            errors.push({ path, message: `must have at least ${schemaNode.minItems} items` });
        }
        if (schemaNode.maxItems !== undefined && value.length > schemaNode.maxItems) {
            errors.push({ path, message: `must have at most ${schemaNode.maxItems} items` });
        }
        if (schemaNode.items) {
            value.forEach((item, i) =>
                validateAgainstSchema(item, schemaNode.items, `${path}[${i}]`, errors),
            );
        }
    }

    // object constraints
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        if (schemaNode.required) {
            for (const key of schemaNode.required) {
                if (!(key in value)) {
                    errors.push({ path, message: `missing required property "${key}"` });
                }
            }
        }
        if (schemaNode.properties) {
            for (const [key, propSchema] of Object.entries(schemaNode.properties)) {
                if (key in value) {
                    validateAgainstSchema(value[key], propSchema, `${path}.${key}`, errors);
                }
            }
        }
    }
}

/** Validate storymap JSON (the object containing a "storymap" property). */
export function validateStorymap(data: any): StorymapError[] {
    const errors: StorymapError[] = [];
    if (data === null || typeof data !== "object" || Array.isArray(data)) {
        return [{ path: "", message: "storymap data must be a JSON object" }];
    }
    if (!("storymap" in data)) {
        return [{ path: "", message: 'missing required property "storymap"' }];
    }
    validateAgainstSchema(data, SCHEMA, "", errors);
    return errors;
}

/** Validate and report all errors to the JavaScript console. Returns true when valid. */
export function validateStorymapAndReport(data: any, source?: string): boolean {
    const errors = validateStorymap(data);
    if (errors.length === 0) {
        return true;
    }
    console.error(
        `StoryMapJS: invalid storymap data${source ? ` (${source})` : ""} - ${errors.length} error${errors.length > 1 ? "s" : ""} found:`,
    );
    for (const err of errors) {
        console.error(`  ${err.path || "(root)"}: ${err.message}`);
    }
    return false;
}
