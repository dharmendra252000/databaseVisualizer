import React, { useState, useRef, useEffect } from "react";
import { X, GripHorizontal } from "lucide-react";

const DatabaseVisualizer = () => {
  const [gridTables, setGridTables] = useState([]);
  const [connections, setConnections] = useState([]);
  const [draggedColumn, setDraggedColumn] = useState(null);
  const [alert, setAlert] = useState("");
  const [highlightedTable, setHighlightedTable] = useState(null);
  const [isResizing, setIsResizing] = useState(false);
  const [resizingTableId, setResizingTableId] = useState(null);
  const [dragPreview, setDragPreview] = useState(null);
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 });
  const [initialMousePos, setInitialMousePos] = useState({ x: 0, y: 0 });
  const [initialSize, setInitialSize] = useState({ width: 0, height: 0 });

  const gridRef = useRef(null);

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

  useEffect(() => {
    const handleScroll = () => {
      setConnections((prev) => [...prev]);
    };

    const gridElement = gridRef.current;
    if (gridElement) {
      gridElement.addEventListener("scroll", handleScroll);
      return () => gridElement.removeEventListener("scroll", handleScroll);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setConnections((prev) => [...prev]);
    };

    const handleMouseMove = (e) => {
      if (draggedColumn) {
        const rect = gridRef.current.getBoundingClientRect();
        setDragPreview({
          x: e.clientX - rect.left + gridRef.current.scrollLeft,
          y: e.clientY - rect.top + gridRef.current.scrollTop,
        });
      }
    };

    const gridElement = gridRef.current;
    if (gridElement) {
      gridElement.addEventListener("scroll", handleScroll);
      document.addEventListener("mousemove", handleMouseMove);
      return () => {
        gridElement.removeEventListener("scroll", handleScroll);
        document.removeEventListener("mousemove", handleMouseMove);
      };
    }
  }, [draggedColumn]);

  const handleColumnDragStart = (e, tableId, column) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setDraggedColumn({
      tableId,
      column,
      startX: rect.right,
      startY: rect.top + rect.height / 2,
    });
    e.dataTransfer.setData("text/plain", "");
    e.dataTransfer.effectAllowed = "link";
  };

  const handleColumnDragLeave = (e) => {
    e.currentTarget.classList.remove("bg-blue-100");
  };

  const handleTableDragStart = (e, table) => {
    const tableData = JSON.stringify(table);
    e.dataTransfer.setData("table", tableData);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleGridDrop = (e) => {
    e.preventDefault();
    const data = e.dataTransfer.getData("table");
    if (!data) {
      return;
    }

    try {
      const tableData = JSON.parse(data);

      const existingTable = gridTables.find((t) => t.id === tableData.id);
      if (existingTable) {
        setHighlightedTable(tableData.id);
        setAlert(`Table ${tableData.name} already exists in the grid`);
        setTimeout(() => {
          setHighlightedTable(null);
          setAlert("");
        }, 3000);
        return;
      }

      const rect = gridRef.current.getBoundingClientRect();
      const scrollLeft = gridRef.current.scrollLeft;
      const scrollTop = gridRef.current.scrollTop;
      const x = e.clientX - rect.left + scrollLeft;
      const y = e.clientY - rect.top + scrollTop;

      setGridTables((prev) => [
        ...prev,
        {
          ...tableData,
          position: { x, y },
          size: { width: 250, height: 200 },
        },
      ]);
    } catch (error) {
      console.error("Error parsing dropped table data:", error);
      setAlert("Error adding table to grid");
      setTimeout(() => setAlert(""), 3000);
    }
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
    if (isResizing) return;

    const rect = gridRef.current.getBoundingClientRect();
    const scrollLeft = gridRef.current.scrollLeft;
    const scrollTop = gridRef.current.scrollTop;
    const x = e.clientX - rect.left + scrollLeft;
    const y = e.clientY - rect.top + scrollTop;

    setGridTables((prev) =>
      prev.map((table) =>
        table.id === tableId ? { ...table, position: { x, y } } : table
      )
    );
  };

  const handleResizeStart = (e, tableId) => {
    e.stopPropagation();
    const table = gridTables.find((t) => t.id === tableId);
    if (table) {
      setIsResizing(true);
      setResizingTableId(tableId);
      setInitialMousePos({ x: e.clientX, y: e.clientY });
      setInitialSize(table.size);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isResizing && resizingTableId) {
        const dx = e.clientX - initialMousePos.x;
        const dy = e.clientY - initialMousePos.y;

        setGridTables((prev) =>
          prev.map((table) => {
            if (table.id === resizingTableId) {
              return {
                ...table,
                size: {
                  width: Math.max(200, initialSize.width + dx),
                  height: Math.max(150, initialSize.height + dy),
                },
              };
            }
            return table;
          })
        );
      }
    };

    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false);
        setResizingTableId(null);
      }
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    isResizing,
    resizingTableId,
    initialMousePos.x,
    initialMousePos.y,
    initialSize,
  ]);

  const calculateColumnPosition = (table, columnIndex) => {
    const columnHeight = 36;
    const headerHeight = 40;
    const columnTop =
      table.position.y +
      headerHeight +
      columnHeight * columnIndex +
      columnHeight / 2;

    return {
      start: {
        x: table.position.x + table.size.width,
        y: columnTop,
      },
      end: {
        x: table.position.x,
        y: columnTop,
      },
    };
  };

  const renderConnection = (connection) => {
    const sourceTable = gridTables.find(
      (t) => t.id === connection.sourceTableId
    );
    const targetTable = gridTables.find(
      (t) => t.id === connection.targetTableId
    );

    if (!sourceTable || !targetTable) return null;

    const sourceColumnIndex = sourceTable.columns.findIndex(
      (c) => c.column_id === connection.sourceColumnId
    );
    const targetColumnIndex = targetTable.columns.findIndex(
      (c) => c.column_id === connection.targetColumnId
    );

    const sourcePos = calculateColumnPosition(sourceTable, sourceColumnIndex);
    const targetPos = calculateColumnPosition(targetTable, targetColumnIndex);

    const distance = targetPos.end.x - sourcePos.start.x;
    const controlPoint1X = sourcePos.start.x + distance * 0.4;
    const controlPoint2X = targetPos.end.x - distance * 0.4;

    const path = `
      M ${sourcePos.start.x} ${sourcePos.start.y}
      C ${controlPoint1X} ${sourcePos.start.y},
        ${controlPoint2X} ${targetPos.end.y},
        ${targetPos.end.x} ${targetPos.end.y}
    `;

    return (
      <g key={connection.id}>
        <path
          d={path}
          stroke="#4299e1"
          strokeWidth="2"
          fill="none"
          className="connection-line"
        />

        <circle
          cx={sourcePos.start.x}
          cy={sourcePos.start.y}
          r="4"
          fill="#4299e1"
        />
        <circle
          cx={targetPos.end.x}
          cy={targetPos.end.y}
          r="4"
          fill="#4299e1"
        />
      </g>
    );
  };

  const handleColumnDragOver = (e, tableId, column) => {
    e.preventDefault();
    if (draggedColumn && draggedColumn.tableId !== tableId) {
      e.currentTarget.classList.add("bg-blue-100");
      e.dataTransfer.dropEffect = "link";
    }
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

      const connectionExists = connections.some(
        (conn) =>
          conn.sourceTableId === newConnection.sourceTableId &&
          conn.sourceColumnId === newConnection.sourceColumnId &&
          conn.targetTableId === newConnection.targetTableId &&
          conn.targetColumnId === newConnection.targetColumnId
      );

      if (!connectionExists) {
        setConnections((prev) => [...prev, newConnection]);
        setAlert(
          `Connected ${draggedColumn.column.name} to ${targetColumn.name}`
        );
        setTimeout(() => setAlert(""), 2000);
      }
    }
    setDraggedColumn(null);
    setDragPreview(null);
  };

  return (
    <div className="flex h-screen">
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

      <div
        ref={gridRef}
        className="flex-1 relative bg-gray-50 p-4 overflow-auto"
        onDrop={handleGridDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        {alert && (
          <div
            className={`absolute top-4 right-4 px-4 py-3 rounded shadow-md z-50
            ${
              alert.includes("already exists")
                ? "bg-red-100 border border-red-400 text-red-700"
                : "bg-green-100 border border-green-400 text-green-700"
            }`}
          >
            {alert}
          </div>
        )}

        {gridTables.map((table) => (
          <div
            key={table.id}
            className={`absolute bg-white rounded shadow-lg ${
              highlightedTable === table.id ? "ring-2 ring-blue-500" : ""
            }`}
            style={{
              left: table.position.x,
              top: table.position.y,
              width: table.size.width,
              height: table.size.height,
            }}
          >
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

            <div
              className="p-2 overflow-y-auto"
              style={{ height: "calc(100% - 40px)" }}
            >
              {table.columns.map((column, index) => (
                <div
                  key={column.column_id}
                  draggable
                  onDragStart={(e) =>
                    handleColumnDragStart(e, table.id, column)
                  }
                  onDragOver={(e) => handleColumnDragOver(e, table.id, column)}
                  onDragLeave={handleColumnDragLeave}
                  onDrop={(e) => handleColumnDrop(e, table.id, column)}
                  className="p-2 border-b hover:bg-gray-50 cursor-pointer relative group"
                >
                  <div className="flex justify-between items-center">
                    <span>
                      {column.name} ({column.column_data_type})
                    </span>
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  </div>
                </div>
              ))}
            </div>

            <div
              className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize bg-gray-200 hover:bg-blue-200"
              onMouseDown={(e) => handleResizeStart(e, table.id)}
            />
          </div>
        ))}

        <svg
          className="absolute inset-0 pointer-events-none"
          style={{
            transform: `translate(${-scrollPosition.x}px, ${-scrollPosition.y}px)`,
            width: "100%",
            height: "100%",
          }}
        >
          {connections.map(renderConnection)}
        </svg>
      </div>
    </div>
  );
};

export default DatabaseVisualizer;
