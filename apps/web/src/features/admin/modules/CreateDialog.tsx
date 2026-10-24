"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { z } from "zod";
import { Button, Dialog, FormField, SelectInput, TextArea, TextInput, useToast } from "@/components/admin-ui";
import { createRecord } from "../data/mock-api";
import type { DatasetKey, RecordRow } from "../data/records";
import type { CreateSpec, FormFieldSpec, FormValues } from "./types";

/** A zod rule per field, built from the module spec (same rules the API will use). */
function fieldSchema(field: FormFieldSpec) {
  return z
    .string()
    .trim()
    .superRefine((value, ctx) => {
      const fail = (message: string) => ctx.addIssue({ code: "custom", message });
      if (!value) {
        if (field.required) fail(`${field.label.replace(/ \(.*\)$/, "")} is required.`);
        return;
      }
      if (field.kind === "number" || field.kind === "money") {
        const number = Number(value);
        if (!Number.isFinite(number)) return fail("Enter a number.");
        if (field.kind === "number" && !Number.isInteger(number)) return fail("Enter a whole number.");
        if (field.kind === "money" && !/^\d+(\.\d{1,2})?$/.test(value)) return fail("Enter an amount in rupees, up to 2 decimals.");
        if (field.min !== undefined && number < field.min) return fail(`Must be at least ${field.min}.`);
      }
      if (field.pattern && !field.pattern.regex.test(value)) fail(field.pattern.message);
    });
}

function validate(spec: CreateSpec, values: FormValues): Partial<Record<string, string>> {
  const shape = Object.fromEntries(spec.fields.map((field) => [field.name, fieldSchema(field)]));
  const result = z.object(shape).safeParse(values);
  const errors: Partial<Record<string, string>> = {};
  if (!result.success) {
    for (const issue of result.error.issues) {
      const key = String(issue.path[0]);
      errors[key] ??= issue.message;
    }
  }
  // Cross-field rules only once each field is valid on its own.
  return Object.keys(errors).length ? errors : (spec.validate?.(values) ?? {});
}

const emptyValues = (spec: CreateSpec): FormValues => Object.fromEntries(spec.fields.map((field) => [field.name, ""]));

export function CreateDialog({
  spec,
  dataset,
  open,
  onClose,
  onCreated,
}: {
  spec: CreateSpec;
  dataset: DatasetKey;
  open: boolean;
  onClose: () => void;
  onCreated: (row: RecordRow) => void;
}) {
  const toast = useToast();
  const [values, setValues] = useState<FormValues>(() => emptyValues(spec));
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const errors = validate(spec, values);
  const visibleError = (name: string) => (submitted || touched[name] ? errors[name] : undefined);

  const close = () => {
    setValues(emptyValues(spec));
    setTouched({});
    setSubmitted(false);
    onClose();
  };

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitted(true);
    if (Object.keys(errors).length) {
      // Move focus to the first invalid field, so keyboard users land on it.
      const first = spec.fields.find((field) => errors[field.name]);
      const form = event.currentTarget as HTMLFormElement;
      form.querySelector<HTMLElement>(`[name="${first?.name}"]`)?.focus();
      return;
    }
    setSaving(true);
    try {
      const trimmed = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value.trim()]));
      const row = await createRecord(dataset, spec.toRow(trimmed), spec.status);
      toast(spec.toast(trimmed));
      onCreated(row);
      close();
    } catch {
      toast("Couldn't save. Your changes are still in the form.", "error");
    } finally {
      setSaving(false);
    }
  }

  const formId = `create-${dataset}`;

  return (
    <Dialog
      open={open}
      onClose={close}
      title={spec.title}
      description={spec.description}
      footer={
        <>
          <Button variant="secondary" onClick={close}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" form={formId} disabled={saving}>
            {saving ? "Saving…" : spec.label}
          </Button>
        </>
      }
    >
      <form id={formId} noValidate onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
        {spec.fields.map((field) => {
          const error = visibleError(field.name);
          const common = {
            name: field.name,
            value: values[field.name] ?? "",
            placeholder: field.placeholder,
            onBlur: () => setTouched((current) => ({ ...current, [field.name]: true })),
          };
          const setValue = (value: string) =>
            setValues((current) => ({ ...current, [field.name]: field.uppercase ? value.toUpperCase() : value }));
          return (
            <FormField
              key={field.name}
              label={field.label}
              required={field.required}
              helper={field.helper}
              error={error}
              className={field.kind === "textarea" || spec.fields.length < 4 ? "sm:col-span-2" : undefined}
            >
              {({ inputId, describedBy, invalid }) => {
                const aria = { id: inputId, "aria-describedby": describedBy, "aria-invalid": invalid || undefined, "aria-required": field.required || undefined };
                if (field.kind === "select") {
                  return (
                    <SelectInput {...common} {...aria} onChange={(event) => setValue(event.target.value)}>
                      <option value="">Select…</option>
                      {field.options?.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </SelectInput>
                  );
                }
                if (field.kind === "textarea") {
                  return <TextArea {...common} {...aria} onChange={(event) => setValue(event.target.value)} />;
                }
                return (
                  <TextInput
                    {...common}
                    {...aria}
                    type={field.kind === "email" ? "email" : field.kind === "tel" ? "tel" : "text"}
                    inputMode={
                      // The numeric keypad has no minus sign, so signed fields keep the full keyboard.
                      field.kind === "number" && field.min !== undefined && field.min >= 0
                        ? "numeric"
                        : field.kind === "money"
                          ? "decimal"
                          : field.kind === "tel"
                            ? "tel"
                            : undefined
                    }
                    autoComplete="off"
                    onChange={(event) => setValue(event.target.value)}
                  />
                );
              }}
            </FormField>
          );
        })}
      </form>
    </Dialog>
  );
}
