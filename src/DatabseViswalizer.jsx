import React, { useState, useRef } from "react";
import { X, GripHorizontal } from "lucide-react";

// Sample data
const initialTables = [
  {
    id: "employees",
    name: "Employees",
    columns: [
      { column_id: "emp_id", name: "ID", column_data_type: "integer" },
      { column_id: "emp_name", name: "Name", column_data_type: "varchar" },
      {
        column_id: "emp_dept",
        name: "Department",
        column_data_type: "varchar",
      },
    ],
  },
  {
    id: "departments",
    name: "Departments",
    columns: [
      { column_id: "dept_id", name: "ID", column_data_type: "integer" },
      { column_id: "dept_name", name: "Name", column_data_type: "varchar" },
    ],
  },
];

const DatabaseVisualizer = () => {
  const [gridTables, setGridTables] = useState([]);
  const [connections, setConnections] = useState([]);
  const [draggedColumn, setDraggedColumn] = useState(null);
  const [alert, setAlert] = useState("");

  const gridRef = useRef(null);

  const handleTableDragStart = (e, table) => {
    e.dataTransfer.setData("table", JSON.stringify(table));
  };

  const handleColumnDragStart = (e, tableId, column) => {
    setDraggedColumn({ tableId, column });
  };

  const handleColumnDragOver = (e, tableId, column) => {
    e.preventDefault();
    if (draggedColumn && draggedColumn.tableId !== tableId) {
      e.currentTarget.classList.add("bg-blue-100");
    }
  };

  const handleColumnDragLeave = (e) => {
    e.currentTarget.classList.remove("bg-blue-100");
  };

  const handleColumnDrop = (e, targetTableId, targetColumn) => {
    e.preventDefault();
    e.currentTarget.classList.remove("bg-blue-100");

    if (draggedColumn && draggedColumn.tableId !== targetTableId) {
      const newConnection = {
        id: `${draggedColumn.tableId}-${draggedColumn.column.column_id}-${targetTableId}-${targetColumn.column_id}`,
        sourceTableId: draggedColumn.tableId,
        sourceColumnId: draggedColumn.column.column_id,
        targetTableId: targetTableId,
        targetColumnId: targetColumn.column_id,
      };

      setConnections((prev) => [...prev, newConnection]);
    }
    setDraggedColumn(null);
  };

  const handleGridDrop = (e) => {
    e.preventDefault();
    const tableData = JSON.parse(e.dataTransfer.getData("table"));

    if (gridTables.some((t) => t.id === tableData.id)) {
      setAlert(`Table ${tableData.name} already exists in the grid`);
      setTimeout(() => setAlert(""), 3000);
      return;
    }

    const rect = gridRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setGridTables((prev) => [
      ...prev,
      {
        ...tableData,
        position: { x, y },
        size: { width: 250, height: 200 },
      },
    ]);
  };

  const handleGridDragOver = (e) => {
    e.preventDefault();
  };

  const handleTableRemove = (tableId) => {
    setGridTables((prev) => prev.filter((t) => t.id !== tableId));
    setConnections((prev) =>
      prev.filter(
        (c) => c.sourceTableId !== tableId && c.targetTableId !== tableId
      )
    );
  };

  const handleTableMove = (e, tableId) => {
    const rect = gridRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setGridTables((prev) =>
      prev.map((table) =>
        table.id === tableId ? { ...table, position: { x, y } } : table
      )
    );
  };

  return (
    <div className="flex h-screen">
      {/* Table List */}
      <div className="w-64 bg-gray-100 p-4 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Available Tables</h2>
        {initialTables.map((table) => (
          <div
            key={table.id}
            draggable
            onDragStart={(e) => handleTableDragStart(e, table)}
            className="bg-white p-3 mb-2 rounded shadow cursor-move hover:bg-gray-50"
          >
            {table.name}
          </div>
        ))}
      </div>

      {/* Grid Area */}
      <div
        ref={gridRef}
        className="flex-1 relative bg-gray-50 p-4"
        onDrop={handleGridDrop}
        onDragOver={handleGridDragOver}
      >
        {/* Alert */}
        {alert && (
          <div className="absolute top-4 right-4 bg-red-100 text-red-700 p-3 rounded">
            {alert}
          </div>
        )}

        {/* Tables in Grid */}
        {gridTables.map((table) => (
          <div
            key={table.id}
            className="absolute bg-white rounded shadow-lg"
            style={{
              left: table.position.x,
              top: table.position.y,
              width: table.size.width,
              height: table.size.height,
            }}
          >
            {/* Table Header */}
            <div className="bg-blue-600 text-white p-2 rounded-t flex justify-between items-center">
              <GripHorizontal
                className="cursor-move"
                onMouseDown={(e) => {
                  const moveHandler = (moveEvent) =>
                    handleTableMove(moveEvent, table.id);
                  document.addEventListener("mousemove", moveHandler);
                  document.addEventListener(
                    "mouseup",
                    () => {
                      document.removeEventListener("mousemove", moveHandler);
                    },
                    { once: true }
                  );
                }}
              />
              <span>{table.name}</span>
              <X
                className="cursor-pointer"
                onClick={() => handleTableRemove(table.id)}
              />
            </div>

            {/* Table Columns */}
            <div className="p-2">
              {table.columns.map((column) => (
                <div
                  key={column.column_id}
                  draggable
                  onDragStart={(e) =>
                    handleColumnDragStart(e, table.id, column)
                  }
                  onDragOver={(e) => handleColumnDragOver(e, table.id, column)}
                  onDragLeave={handleColumnDragLeave}
                  onDrop={(e) => handleColumnDrop(e, table.id, column)}
                  className="p-2 border-b hover:bg-gray-50"
                >
                  {column.name} ({column.column_data_type})
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Connection Lines */}
        <svg className="absolute inset-0 pointer-events-none">
          {connections.map((connection) => {
            const sourceTable = gridTables.find(
              (t) => t.id === connection.sourceTableId
            );
            const targetTable = gridTables.find(
              (t) => t.id === connection.targetTableId
            );

            if (!sourceTable || !targetTable) return null;

            const sourceColumn = sourceTable.columns.findIndex(
              (c) => c.column_id === connection.sourceColumnId
            );
            const targetColumn = targetTable.columns.findIndex(
              (c) => c.column_id === connection.targetColumnId
            );

            const startX = sourceTable.position.x + sourceTable.size.width;
            const startY = sourceTable.position.y + 40 + sourceColumn * 36;
            const endX = targetTable.position.x;
            const endY = targetTable.position.y + 40 + targetColumn * 36;

            return (
              <path
                key={connection.id}
                d={`M ${startX} ${startY} C ${startX + 50} ${startY}, ${
                  endX - 50
                } ${endY}, ${endX} ${endY}`}
                stroke="#4299e1"
                strokeWidth="2"
                fill="none"
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default DatabaseVisualizer;
