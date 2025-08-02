import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const HierarchicalTable = () => {
  const initialData = {
    rows: [
      {
        id: "electronics",
        label: "Electronics",
        value: 1500,
        children: [
          {
            id: "phones",
            label: "Phones",
            value: 800,
          },
          {
            id: "laptops",
            label: "Laptops",
            value: 700,
          },
        ],
      },
      {
        id: "furniture",
        label: "Furniture",
        value: 1000,
        children: [
          {
            id: "tables",
            label: "Tables",
            value: 300,
          },
          {
            id: "chairs",
            label: "Chairs",
            value: 700,
          },
        ],
      },
    ],
  };

  const [data, setData] = useState(initialData);
  const [originalData] = useState(initialData);
  const [inputValues, setInputValues] = useState({});

  const calculateTotals = (rows) => {
    return rows.map((row) => {
      if (row.children && row.children.length > 0) {
        const updatedChildren = calculateTotals(row.children);
        const childrenTotal = updatedChildren.reduce(
          (sum, child) => sum + child.value,
          0
        );
        return {
          ...row,
          children: updatedChildren,
          value: childrenTotal,
        };
      }
      return row;
    });
  };

  const getOriginalValue = (id, originalRows) => {
    for (const row of originalRows) {
      if (row.id === id) return row.value;
      if (row.children) {
        const childValue = getOriginalValue(id, row.children);
        if (childValue !== null) return childValue;
      }
    }
    return null;
  };

  const calculateVariance = (currentValue, originalValue) => {
    if (originalValue === 0) return 0;
    const data = ((currentValue - originalValue) / originalValue) * 100;
    const variance = Math.trunc(data * 100) / 100;
    return variance;
  };

  const updateRowValue = (id, newValue, isPercentage = false) => {
    const updateRow = (rows) => {
      return rows.map((row) => {
        if (row.id === id) {
          let updatedValue;
          if (isPercentage) {
            updatedValue = row.value * (1 + newValue / 100);
          } else {
            updatedValue = newValue;
          }

          if (row.children && row.children.length > 0 && !isPercentage) {
            const currentTotal = row.children.reduce(
              (sum, child) => sum + child.value,
              0
            );
            if (currentTotal > 0) {
              const updatedChildren = row.children.map((child) => ({
                ...child,
                value: (child.value / currentTotal) * updatedValue,
              }));
              return {
                ...row,
                children: updatedChildren,
                value: updatedValue,
              };
            }
          }

          return {
            ...row,
            value: updatedValue,
          };
        }

        if (row.children) {
          return {
            ...row,
            children: updateRow(row.children),
          };
        }

        return row;
      });
    };

    const updatedRows = updateRow(data.rows);
    const recalculatedRows = calculateTotals(updatedRows);
    setData({ rows: recalculatedRows });
  };

  const handleInputChange = (id, value) => {
    setInputValues({
      ...inputValues,
      [id]: value,
    });
  };

  const handleAllocationPercent = (id) => {
    const inputValue = parseFloat(inputValues[id] || 0);
    if (!isNaN(inputValue)) {
      updateRowValue(id, inputValue, true);
      setInputValues({ ...inputValues, [id]: "" });
    }
  };

  const handleAllocationValue = (id) => {
    const inputValue = parseFloat(inputValues[id] || 0);
    if (!isNaN(inputValue)) {
      updateRowValue(id, inputValue, false);
      setInputValues({ ...inputValues, [id]: "" });
    }
  };

  const renderRow = (row, level = 0, isChild = false) => {
    const originalValue = getOriginalValue(row.id, originalData.rows);
    const variance = calculateVariance(row.value, originalValue);
    const indentClass = level > 0 ? `ps-${3 + level}` : "";

    return (
      <React.Fragment key={row.id}>
        <tr className={isChild ? "table-light" : ""}>
          <td className={`align-middle ${indentClass}`}>
            <div className="d-flex align-items-center">
              {level > 0 && <span className="text-muted me-2">--</span>}
              <span
                className={`fw-medium ${
                  isChild ? "text-secondary" : "text-dark"
                }`}
              >
                {row.label}
              </span>
            </div>
          </td>
          <td className="align-middle">
            <span
              className={`fw-semibold ${
                isChild ? "text-secondary" : "text-dark"
              }`}
            >
              ${row.value.toFixed(2)}
            </span>
          </td>
          <td className="align-middle">
            <input
              type="number"
              className="form-control form-control-sm"
              style={{ width: "80px" }}
              placeholder="Value"
              value={inputValues[row.id] || ""}
              onChange={(e) => handleInputChange(row.id, e.target.value)}
            />
          </td>
          <td className="align-middle">
            <button
              onClick={() => handleAllocationPercent(row.id)}
              className="btn btn-primary btn-sm"
              title="Apply as percentage change"
            >
              Apply %
            </button>
          </td>
          <td className="align-middle">
            <button
              onClick={() => handleAllocationValue(row.id)}
              className="btn btn-success btn-sm"
              title="Set as direct value"
            >
              Set Value
            </button>
          </td>
          <td className="align-middle">
            <span>
              {variance > 0 ? "+" : ""}
              {variance} %
            </span>
          </td>
        </tr>
        {row.children &&
          row.children.map((child) => renderRow(child, level + 1, true))}
      </React.Fragment>
    );
  };

  return (
    <>
      <div className="container-fluid py-4">
        <div className="row justify-content-center">
          <div className="col-12 col-xl-10">
            <h1 className="display-5 fw-bold text-dark mb-4">
              Hierarchical Budget Allocation
            </h1>

            <div className="card shadow-lg">
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-dark">
                      <tr>
                        <th scope="col" className="fw-semibold">
                          Label
                        </th>
                        <th scope="col" className="fw-semibold">
                          Value
                        </th>
                        <th scope="col" className="fw-semibold">
                          Input
                        </th>
                        <th scope="col" className="fw-semibold">
                          Allocation %
                        </th>
                        <th scope="col" className="fw-semibold">
                          Allocation Val
                        </th>
                        <th scope="col" className="fw-semibold">
                          Variance
                        </th>
                      </tr>
                    </thead>
                    <tbody>{data.rows.map((row) => renderRow(row))}</tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HierarchicalTable;
