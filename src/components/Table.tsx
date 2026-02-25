import { ReactNode } from "react";

interface TableProps {
  children: ReactNode;
  className?: string;
}

export const Table = ({ children, className = "" }: TableProps) => {
  return (
    <div
      className={`overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}
    >
      <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
        {children}
      </table>
    </div>
  );
};

interface TableHeaderProps {
  children: ReactNode;
}

export const TableHeader = ({ children }: TableHeaderProps) => {
  return (
    <thead className="bg-primary-50/60 dark:bg-gray-900">
      <tr>{children}</tr>
    </thead>
  );
};

interface TableHeaderCellProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  sortable?: boolean;
}

export const TableHeaderCell = ({
  children,
  className = "",
  onClick,
  sortable = false,
}: TableHeaderCellProps) => {
  const baseStyles =
    "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider";
  const sortableStyles = sortable
    ? "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
    : "";

  return (
    <th
      className={`${baseStyles} ${sortableStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </th>
  );
};

interface TableBodyProps {
  children: ReactNode;
}

export const TableBody = ({ children }: TableBodyProps) => {
  return (
    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
      {children}
    </tbody>
  );
};

interface TableRowProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export const TableRow = ({
  children,
  className = "",
  onClick,
}: TableRowProps) => {
  const clickableStyles = onClick
    ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
    : "";

  return (
    <tr className={`${clickableStyles} ${className}`} onClick={onClick}>
      {children}
    </tr>
  );
};

interface TableCellProps {
  children: ReactNode;
  className?: string;
  colSpan?: number;
}

export const TableCell = ({
  children,
  className = "",
  colSpan,
}: TableCellProps) => {
  return (
    <td
      className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 ${className}`}
      colSpan={colSpan}
    >
      {children}
    </td>
  );
};
