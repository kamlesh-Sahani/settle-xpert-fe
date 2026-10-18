import { lazy, memo, useMemo } from "react";
import { useWatch } from "react-hook-form";
import { Row, Col, Tooltip } from "antd";
import { BsQuestionCircle } from "react-icons/bs";
import { Virtuoso } from "react-virtuoso";
import { FieldConfig } from "@/types/formField.types";
import { isArray, isNotEmptyArray, isString } from "@/common/utils/main.utils";
import NotFundField from "../form/NotFundField";

const fields: Record<string, any> = {
  "select": lazy(() => import("../form/SelectField")),
  "heading": lazy(() => import("../form/TextField")),
  "paragraph": lazy(() => import("../form/TextField")),
  "divider": lazy(() => import("../form/DividerField")),
  "phone": lazy(() => import("../form/PhoneField")),
  "text": lazy(() => import("../form/InputField")),
  "email": lazy(() => import("../form/InputField")),
  "url": lazy(() => import("../form/InputField")),
  "input": lazy(() => import("../form/InputField")),
  "password": lazy(() => import("../form/PasswordField")),
  "number": lazy(() => import("../form/NumberField")),
  "textarea": lazy(() => import("../form/TextAreaField")),
  "richtext": lazy(() => import("../form/RichTextField")),
  "multiselect": lazy(() => import("../form/MultiSelectField")),
  "country": lazy(() => import("../form/CountryField")),
  "autocomplete": lazy(() => import("../form/AutocompleteField")),
  "radio": lazy(() => import("../form/RadioField")),
  "checkbox": lazy(() => import("../form/CheckboxField")),
  "toggle": lazy(() => import("../form/SwitchField")),
  "date": lazy(() => import("../form/DateField")),
  "time": lazy(() => import("../form/TimePickerField")),
  "datetime": lazy(() => import("../form/DateField")), // Or DateTimeField if separate, but DateField handles it with showTime
  "file": lazy(() => import("../form/upload")),
  "image": lazy(() => import("../form/upload")),
  "rating": lazy(() => import("../form/RatingField")),
  "slider": lazy(() => import("../form/SliderField")),
  "color": lazy(() => import("../form/ColorPickerField")),
  "cascader": lazy(() => import("../form/CascaderField")),
  "treeselect": lazy(() => import("../form/TreeSelectField")),
  "daterange": lazy(() => import("../form/DateRangeField")),
  "timerange": lazy(() => import("../form/TimeRangeField")),
  "hidden": lazy(() => import("../form/HiddenField")),
  "chart": lazy(() => import("../dynamic/DynamicChartField")),
};
type RowType = FieldConfig[];
interface DynamicFieldsProps {
  rows: RowType[];
  methods: any;
}
const textTypes = new Set(['heading', 'paragraph', 'textField']);

const evaluateConditions = (
  conditions: any[] | undefined,
  watchedValues: any[],
) => {
  if (!isNotEmptyArray(conditions)) return true;
  if (conditions!.length !== watchedValues.length) return false;

  return conditions!.every((condition: any, index: number) => {
    const value = watchedValues[index];
    switch (condition.operator) {
      case "equals":
        return value === condition.value;
      case "not_equals":
        return value !== condition.value;
      case "contains":
        if (isArray(value)) return value.includes(condition.value);
        if (isString(value))
          return value.includes(String(condition.value));
        return false;
      case "gt":
        return Number(value) > Number(condition.value);
      case "lt":
        return Number(value) < Number(condition.value);
      default:
        return true;
    }
  });
};


const DynamicFields: React.FC<DynamicFieldsProps> = ({ rows, methods }) => {
  if (!isNotEmptyArray(rows)) return null;
  return (
    <Virtuoso
      style={{ height: "100%" }}
      data={rows}
      totalCount={rows.length}
      itemContent={(_, row) => {
        return <FormRow row={row} control={methods.control} />;
      }}
    />
  );
};

export default memo(DynamicFields);

const SingleField = memo(function SingleField({ config, control }: { config: FieldConfig; control: any }) {
  const dependentFields = useMemo(
    () =>
      isNotEmptyArray(config?.conditions)
        ? config?.conditions?.map((c) => c.field)
        : [],
    [config?.conditions],
  );

  const watchedValues = useWatch({
    control,
    name: dependentFields as any,
    disabled: dependentFields?.length === 0,
  });

  const isVisible = useMemo(
    () =>
      evaluateConditions(
        config?.conditions,
        isArray(watchedValues) ? watchedValues : [],
      ),
    [config?.conditions, watchedValues],
  );

  if (!isVisible) return null;

  const Field = fields[config?.type] || NotFundField;
  return (
    <Col span={config?.span || 24} offset={config?.offset || 0} className="mb-4">
      {
        !textTypes.has(config?.type) && config?.label && (
          <div className="text-[13px] mb-[3px] flex items-center gap-1 text-text-primary font-medium">
            <span>{config?.label}</span>
            {config?.tooltip && (
              <Tooltip
                title={config.tooltip}
                placement="top"
                color="#374151"
                overlayInnerStyle={{ fontSize: '12px', padding: '6px 10px', borderRadius: '6px' }}
              >
                <span className="flex items-center justify-center pt-[1px]">
                  <BsQuestionCircle className="text-[11.5px] text-text-secondary cursor-help hover:text-blue-500 transition-colors" />
                </span>
              </Tooltip>
            )}
          </div>
        )
      }
      <Field {...config} control={control} />
    </Col>
  );
});

const FormRow = memo(function FormRow({ row, control }: { row: RowType; control: any }) {
  if (!isNotEmptyArray(row)) return null;

  return (
    <Row gutter={[24, 0]} style={{ marginTop: "0px" }}>
      {row.map((field) => (
        <SingleField key={field.id} config={field} control={control} />
      ))}
    </Row>
  );
});
