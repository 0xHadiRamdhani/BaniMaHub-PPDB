import type { ChangeEvent } from "react";
import { UploadCloud, CheckCircle2 } from "lucide-react";

type TextFieldProps = {
    name: string;
    label: string;
    type?: "text" | "date" | "tel";
    defaultValue?: string;
    placeholder?: string;
};

export function TextField({ name, label, type = "text", defaultValue, placeholder }: TextFieldProps) {
    return (
        <label className="block text-[13px] font-bold text-ink">
            {label}
            <input
                required
                name={name}
                type={type}
                defaultValue={defaultValue}
                placeholder={placeholder}
                className="mt-2 block w-full rounded-xl border border-neutral-300 bg-paper px-4 py-3.5 text-sm font-normal text-ink outline-none transition-all focus:border-primary"
            />
        </label>
    );
}

type UploadFieldProps = {
    name: string;
    label: string;
    filename?: string;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

export function UploadField({ name, label, filename, onChange }: UploadFieldProps) {
    return (
        <label className="block cursor-pointer rounded-2xl border border-neutral-300 bg-paper-soft p-4 transition-colors hover:border-primary/50">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                            filename ? "bg-[#DCFCE7] text-[#15803D]" : "bg-primary-soft text-primary"
                        }`}
                    >
                        {filename ? <CheckCircle2 size={20} /> : <UploadCloud size={20} />}
                    </span>
                    <div>
                        <span className="block text-sm font-extrabold text-ink">{label}</span>
                        <span className="block text-xs text-neutral-500">
                            {filename ? `Terpilih: ${filename}` : "Klik untuk pilih file PDF, JPG, atau PNG (Maks. 2MB)"}
                        </span>
                    </div>
                </div>
                <span className="rounded-lg border border-neutral-300 bg-paper px-3 py-1.5 text-xs font-bold text-primary">
                    {filename ? "Ganti File" : "Pilih File"}
                </span>
            </div>
            <input
                required={!filename}
                name={name}
                type="file"
                accept=".pdf,image/*"
                onChange={onChange}
                className="sr-only"
            />
        </label>
    );
}

export function StepIndicator({ steps, currentStep }: { steps: string[]; currentStep: number }) {
    return (
        <div className="mb-6 grid grid-cols-4 gap-2 sm:gap-3">
            {steps.map((label, index) => {
                const isActive = index === currentStep;
                const isDone = index < currentStep;
                return (
                    <div
                        key={label}
                        className={`flex flex-col items-center rounded-2xl border p-3 text-center transition-all ${
                            isActive
                                ? "border-[#1D4ED8] bg-[#EFF6FF] text-[#1D4ED8] shadow-xs"
                                : isDone
                                  ? "border-[#15803D]/30 bg-[#DCFCE7]/50 text-[#15803D]"
                                  : "border-neutral-300 bg-paper text-neutral-500"
                        }`}
                    >
                        <span
                            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-black ${
                                isActive
                                    ? "bg-[#1D4ED8] text-white"
                                    : isDone
                                      ? "bg-[#15803D] text-white"
                                      : "bg-paper-soft text-neutral-500"
                            }`}
                        >
                            {isDone ? "✓" : `0${index + 1}`}
                        </span>
                        <span className="mt-1.5 text-[11px] font-extrabold sm:text-xs">{label}</span>
                    </div>
                );
            })}
        </div>
    );
}

