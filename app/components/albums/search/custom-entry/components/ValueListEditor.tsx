"use client";

import { Plus, Trash2 } from "lucide-react";
import { t } from "../../../../../../lib/translations";
import SectionPanel from "./SectionPanel";

type ValueListEditorProps = {
  locale: "en" | "nl";
  title: string;
  helpText?: string;
  values: string[];
  setValues: (updater: (prev: string[]) => string[]) => void;
  addLabel: string;
  placeholder?: string;
  datalistId?: string;
  datalistOptions?: string[];
};

export default function ValueListEditor({
  locale,
  title,
  helpText,
  values,
  setValues,
  addLabel,
  placeholder,
  datalistId,
  datalistOptions,
}: ValueListEditorProps) {
  return (
    <SectionPanel
      title={title}
      headerRight={
        <button
          type="button"
          className="h-9 w-9 sm:w-auto sm:px-3 rounded cursor-pointer flex items-center justify-center gap-2 custom-entry__btn__add"
          onClick={() => setValues((prev) => [...prev, ""])}
        >
          <Plus size={16} />
          <span className="hidden sm:inline">{addLabel}</span>
        </button>
      }
      description={helpText}
    >
      {values.length > 0 && (
        <div className="flex flex-col gap-2">
          {values.map((value, index) => (
            <div key={index} className="flex gap-2 items-center">
              <input
                className="border rounded px-3 py-2 w-full custom-entry__input"
                value={value}
                onChange={(e) =>
                  setValues((prev) => {
                    const next = [...prev];
                    next[index] = e.target.value;
                    return next;
                  })
                }
                placeholder={placeholder}
                list={datalistId}
              />
              <button
                type="button"
                className="h-10 px-3 rounded cursor-pointer flex items-center justify-center custom-entry__btn__delete"
                onClick={() =>
                  setValues((prev) => prev.filter((_, i) => i !== index))
                }
                title={t(locale, "remove")}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          {datalistId && datalistOptions && datalistOptions.length > 0 && (
            <datalist id={datalistId}>
              {datalistOptions.map((opt) => (
                <option key={opt} value={opt} />
              ))}
            </datalist>
          )}
        </div>
      )}
    </SectionPanel>
  );
}
