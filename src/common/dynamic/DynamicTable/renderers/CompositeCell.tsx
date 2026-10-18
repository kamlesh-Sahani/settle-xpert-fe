"use client";

import { memo, type FC } from "react";
import type { TableCellType } from "../types";
import { isNotEmptyArray } from "@/common/utils/main.utils";
import ImageCell from "./ImageCell";
import TextCell from "./TextCell";
import LinkCell from "./LinkCell";
import StatusCell from "./StatusCell";
import ActionCell from "./ActionCell";
import DynamicFormCell from "./DynamicFormCell";
import ModalCell from "./ModalCell";

interface CompositeCellProps {
  cells: TableCellType[];
  record?: any;
  onActionClick?: (data: any, record?: any) => void;
}

export const cellRendererRegistry: Record<string, FC<any>> = {
  IMAGE: ImageCell,
  TEXT: TextCell,
  LINK: LinkCell,
  STATUS: StatusCell,
  ACTION: ActionCell,
  DYNAMIC_FORM: DynamicFormCell,
  MODAL: ModalCell
};
function CompositeCell({ cells, record, onActionClick }: CompositeCellProps) {
  if (!isNotEmptyArray(cells)) return null;

  return (
    <div className="flex gap-2 items-center">
      {cells.map((cell: TableCellType, i) => {
        const Renderer = cellRendererRegistry[cell.type];
        if (!Renderer) return null;
        return <div key={i} className={`flex flex-col gap-1 ${cell.type === "IMAGE" && !cell.subTitle ? "" : "w-full"}`}>
          <Renderer {...cell} record={record} onActionClick={onActionClick} />
          {
            cell?.subTitle && <div className="text-sm text-text-secondary text-[12px]">
              {cell?.subTitle}
            </div>
          }
        </div>;
      })}
    </div>
  );
}

export default memo(CompositeCell);
