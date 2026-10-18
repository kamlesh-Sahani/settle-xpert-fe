import { FieldConfig } from "@/types/formField.types"

const NotFundField = (props: FieldConfig) => {
    return (
        <div className="bg-secondary border border-border text-text-secondary h-[30px] flex items-center justify-center rounded-[4px] text-[13px]"> &quot;{props?.type}&quot; Not Found</div>
    )
}

export default NotFundField