import { motion } from "framer-motion";
import { X, GripVertical, Edit3 } from "lucide-react";
import React, { useEffect, useMemo, useState, useRef } from "react";
import { toast } from "react-toastify";

// info shape expected:
// { assign_id, quote_id, label/infoLabel, infoParsed|info }
const AdminDetailsEditModal = ({ info, onClose, onSave }) => {
  const initial = useMemo(() => {
    const parsed = info?.infoParsed || info?.info || {};
    return {
      plan: parsed.plan || info?.label || info?.infoLabel || "",
      price: parsed.price ?? "",
      currency: parsed.currency ?? "",
      otherCurrency: parsed.otherCurrency ?? "",
      noOfWords: parsed.noOfWords ?? "",
      milestones:
        parsed.milestones ??
        (Array.isArray(parsed.milestoneData) ? parsed.milestoneData.length : 0),
      milestoneData: Array.isArray(parsed.milestoneData)
        ? parsed.milestoneData.map((m) => ({
            name: m.name ?? "",
            price: m.price ?? "",
            percentage: m.percentage ?? "",
            parametersData: Array.isArray(m.parametersData)
              ? m.parametersData.map((p) => ({
                  parameters: p.parameters ?? "",
                  no_of_words: p.no_of_words ?? "",
                  time_frame: p.time_frame ?? "",
                }))
              : [],
          }))
        : [],
      remarks: parsed.remarks ?? "",
      tandc: parsed.tandc ?? "",
    };
  }, [info]);

  const [form, setForm] = useState(initial);
  const [editingParams, setEditingParams] = useState({});

  const LoopUserData = localStorage.getItem("loopuser");

  const loopUserObject = JSON.parse(LoopUserData);
  // Drag refs for parameter reordering
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);
  const close = () => onClose && onClose();
  const save = () => {
    // Validate that milestone prices sum equals total price
    const totalPrice = Math.round(Number(form.price) || 0);
    const milestoneSum = form.milestoneData.reduce((sum, milestone) => {
      return sum + Math.round(Number(milestone.price) || 0);
    }, 0);

    if (totalPrice !== milestoneSum) {
      toast.error(
        `Total price (${totalPrice}) must equal sum of milestone prices (${milestoneSum})`,
      );
      return;
    }

    const payload = {
      user_id: loopUserObject?.id,
      assign_id: info?.assign_id,
      quote_id: info?.quote_id,
      infoLabel: info?.label || info?.infoLabel || form.plan,
      infoParsed: {
        plan: form.plan,
        price: form.price,
        currency: form.currency,
        otherCurrency: form.otherCurrency,
        noOfWords: form.noOfWords,
        milestones: Number(form.milestones) || 0,
        milestoneData: form.milestoneData,
        remarks: form.remarks,
        tandc: form.tandc,
      },
    };
    onSave && onSave(payload);
  };

  const [currencies, setCurrencies] = useState([]);

  const fetchCurrencies = async () => {
    try {
      const response = await fetch(
        "https://loopback-skci.onrender.com/api/scope/getCurrencies",
      );
      const data = await response.json();
      if (data.status) {
        setCurrencies(data.data || []); // Set fetched currencies
      } else {
        toast.error("Failed to fetch currencies");
      }
    } catch (error) {
      console.error("Error fetching currencies:", error);
      toast.error("Error fetching currencies");
    }
  };

  useEffect(() => {
    fetchCurrencies();
  }, []);

  // After currencies are fetched, normalize form.currency from info (e.g., "INR")
  // to the dropdown value (id/_id/code/value) if needed.
  useEffect(() => {
    if (!Array.isArray(currencies) || currencies.length === 0) return;
    const current = form?.currency;
    if (!current || current === "other") return; // nothing to normalize or keep "other"

    // If current already matches one of the option values, skip
    const alreadyMatches = currencies.some(
      (c) => String(c?.name) === String(current),
    );
    if (alreadyMatches) return;

    const lowered = String(current).toLowerCase();
    const matched = currencies.find((c) =>
      [c?.name].some((v) => String(v ?? "").toLowerCase() === lowered),
    );

    if (matched) {
      const normalizedValue = matched?.name;
      updateField("currency", String(normalizedValue));
    }
  }, [currencies]);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const addMilestone = (targetCount) => {
    // If a specific count is provided (e.g., from dropdown), set to that count and distribute price
    if (typeof targetCount === "number" && !Number.isNaN(targetCount)) {
      setForm((prev) => {
        const currentPriceNumber = Number(prev.price);
        if (!currentPriceNumber || currentPriceNumber <= 0) {
          toast.error("pls enter price");
          return prev;
        }

        const boundedCount = Math.max(0, Math.min(10, Number(targetCount)));
        // Build or trim milestoneData to match boundedCount
        const existing = Array.isArray(prev.milestoneData)
          ? [...prev.milestoneData]
          : [];
        let nextMilestoneData = existing.slice(0, boundedCount);
        while (nextMilestoneData.length < boundedCount) {
          nextMilestoneData.push({
            name: "",
            price: "",
            percentage: "",
            parametersData: [],
          });
        }

        // Distribute price equally across milestones as integers (round numbers)
        const totalInt = Math.round(currentPriceNumber);
        const baseInt =
          boundedCount > 0 ? Math.floor(totalInt / boundedCount) : 0;
        let remainder =
          boundedCount > 0 ? totalInt - baseInt * boundedCount : 0;

        nextMilestoneData = nextMilestoneData.map((m, idx) => {
          let amount = baseInt;
          if (remainder > 0) {
            amount += 1;
            remainder -= 1;
          }
          return { ...m, price: String(amount) };
        });

        return {
          ...prev,
          milestones: boundedCount,
          milestoneData: nextMilestoneData,
        };
      });
      return;
    }

    // Default behavior: increment by one and append a new blank milestone
    setForm((prev) => ({
      ...prev,
      milestones: Number(prev.milestones) + 1,
      milestoneData: [
        ...prev.milestoneData,
        { name: "", price: "", percentage: "", parametersData: [] },
      ],
    }));
  };

  const updateMilestone = (idx, key, value) => {
    setForm((prev) => {
      const copy = [...prev.milestoneData];

      // If editing price, just update that specific milestone price without affecting others
      if (key === "price") {
        const nextValRaw = Math.round(Number(value || 0));
        copy[idx] = { ...copy[idx], price: String(nextValRaw) };
        return { ...prev, milestoneData: copy };
      }

      // For non-price keys, simple update
      copy[idx] = { ...copy[idx], [key]: value };
      return { ...prev, milestoneData: copy };
    });
  };

  const handlePercentageChange = (idx, value) => {
    // Validate percentage input (allow only numbers and decimal)
    if (!/^\d*\.?\d*$/.test(value)) return;

    const percentage = parseFloat(value) || 0;

    // Calculate current total percentage excluding this milestone
    const currentTotal = form.milestoneData.reduce((sum, ms, index) => {
      if (index === idx) return sum;
      return sum + (parseFloat(ms.percentage) || 0);
    }, 0);

    if (currentTotal + percentage > 100) {
      toast.error("Total percentage cannot exceed 100%");
      return;
    }

    const totalPrice = parseFloat(form.price) || 0;
    const calculatedPrice = Math.round((totalPrice * percentage) / 100);

    setForm((prev) => {
      const copy = [...prev.milestoneData];
      copy[idx] = {
        ...copy[idx],
        percentage: value,
        price: String(calculatedPrice),
      };
      return { ...prev, milestoneData: copy };
    });
  };

  const handleTotalPriceChange = (value) => {
    if (!/^\d*$/.test(value)) return;

    setForm((prev) => {
      let newMilestoneData = [...prev.milestoneData];

      // Recalculate milestone prices based on existing percentages
      if (value && newMilestoneData.length > 0) {
        const totalPrice = parseFloat(value);
        newMilestoneData = newMilestoneData.map((ms) => {
          const percentage = parseFloat(ms.percentage) || 0;
          const calculatedPrice = Math.round((totalPrice * percentage) / 100);
          return {
            ...ms,
            price: percentage > 0 ? String(calculatedPrice) : ms.price || "",
          };
        });
      }

      return {
        ...prev,
        price: value,
        milestoneData: newMilestoneData,
      };
    });
  };

  const addParameter = (mIdx) => {
    setForm((prev) => {
      const copy = [...prev.milestoneData];
      const params = copy[mIdx]?.parametersData || [];
      copy[mIdx] = {
        ...copy[mIdx],
        parametersData: [
          ...params,
          { parameters: "", no_of_words: "", time_frame: "" },
        ],
      };
      return { ...prev, milestoneData: copy };
    });
  };

  const removeParameter = (mIdx, pIdx) => {
    setForm((prev) => {
      const copy = [...prev.milestoneData];
      const params = copy[mIdx]?.parametersData || [];
      copy[mIdx] = {
        ...copy[mIdx],
        parametersData: params.filter((_, i) => i !== pIdx),
      };
      return { ...prev, milestoneData: copy };
    });
  };

  const updateParameter = (mIdx, pIdx, key, value) => {
    setForm((prev) => {
      const copy = [...prev.milestoneData];
      const params = [...(copy[mIdx]?.parametersData || [])];
      params[pIdx] = { ...params[pIdx], [key]: value };
      copy[mIdx] = { ...copy[mIdx], parametersData: params };
      return { ...prev, milestoneData: copy };
    });
  };

  // Handle drag and drop for parameter reordering
  const handleSortParameter = (mIdx) => {
    setForm((prev) => {
      const copy = [...prev.milestoneData];
      const params = [...(copy[mIdx]?.parametersData || [])];

      const dragItemContent = params[dragItem.current];
      params.splice(dragItem.current, 1);
      params.splice(dragOverItem.current, 0, dragItemContent);

      copy[mIdx] = { ...copy[mIdx], parametersData: params };

      // Reset drag refs
      dragItem.current = null;
      dragOverItem.current = null;

      return { ...prev, milestoneData: copy };
    });
  };

  // Numeric-only helpers for inputs
  const sanitizeNumeric = (value) => String(value).replace(/\D+/g, "");
  const handleNumericKeyDown = (e) => {
    const { key, ctrlKey, metaKey } = e;

    // Allow navigation/editing keys
    const allowed = [
      "Backspace",
      "Delete",
      "Tab",
      "Escape",
      "Enter",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Home",
      "End",
    ];
    if (allowed.includes(key)) return;

    // Allow select/copy/paste/cut shortcuts
    if (
      (ctrlKey || metaKey) &&
      ["a", "c", "v", "x"].includes(key.toLowerCase())
    )
      return;

    // Allow digits only
    if (key >= "0" && key <= "9") return;

    // Block everything else (including minus, plus, dot, letters, symbols)
    e.preventDefault();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity"
        onClick={close}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-3xl max-h-[90vh] bg-white backdrop-saturate-150 rounded shadow-2xl ring-1 ring-slate-200 flex flex-col"
      >
        <div className="flex items-center justify-between p-2 pb-2 border-b border-slate-200 flex-shrink-0">
          <h3 className="text-xl font-semibold tracking-tight text-slate-800">
            Edit {info?.label || info?.infoLabel} Plan
          </h3>
          <button
            className="btn btn-sm btn-danger px-1 py-0.5 text-[11px] rounded-md shadow hover:shadow-md hover:opacity-90 transition"
            onClick={close}
          >
            <X size={15} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 text-[11px]">
                  Price
                </label>
                <input
                  className="form-control rounded-md border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition px-2 py-1 text-[11px]"
                  value={form.price}
                  onKeyDown={handleNumericKeyDown}
                  onChange={(e) => {
                    const sanitized = sanitizeNumeric(e.target.value);
                    handleTotalPriceChange(sanitized);
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 text-[11px]">
                  Currency
                </label>
                <select
                  className="form-control rounded-md border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition px-2 py-1 text-[11px]"
                  value={form.currency}
                  onChange={(e) => {
                    const selected = e.target.value;
                    updateField("currency", selected);
                    if (selected !== "other") {
                      updateField("otherCurrency", "");
                    }
                  }}
                >
                  <option value="">Select currency</option>
                  {Array.isArray(currencies) &&
                    currencies.map((c) => (
                      <option key={c?.id} value={c?.name}>
                        {c?.name}
                      </option>
                    ))}
                  <option value="other">Other</option>
                </select>
              </div>
              {form.currency === "other" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 text-[11px]">
                    Other Currency
                  </label>
                  <input
                    className="form-control rounded-md border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition px-2 py-1 text-[11px]"
                    value={form.otherCurrency}
                    onChange={(e) =>
                      updateField("otherCurrency", e.target.value)
                    }
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 text-[11px]">
                  No of Words
                </label>
                <input
                  className="form-control rounded-md border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition px-2 py-1 text-[11px]"
                  value={form.noOfWords}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow numbers and commas for large numbers
                    if (/^[0-9,]*$/.test(value)) {
                      updateField("noOfWords", value);
                    }
                  }}
                  onPaste={(e) => {
                    e.preventDefault();
                    const paste = (
                      e.clipboardData || window.clipboardData
                    ).getData("text");
                    const numbers = paste.replace(/[^0-9,]/g, "");
                    updateField("noOfWords", numbers);
                  }}
                  placeholder="Enter no of words"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-start">
                <label className="block text-sm font-medium text-slate-700 text-[11px]">
                  No. of Milestones:{" "}
                </label>
                <div className="flex items-center gap-2 ml-2">
                  <select
                    className="form-control w-28 rounded-md border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition px-2 py-1 text-[11px]"
                    value={Number(form.milestones) || 0}
                    onChange={(e) => {
                      const count = Number(e.target.value);
                      if (!count) return; // ignore 0
                      addMilestone(count);
                    }}
                  >
                    <option value={0}>Select</option>
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-2 space-y-3">
                {form.milestoneData.map((m, mIdx) => (
                  <div
                    key={mIdx}
                    className="border border-slate-200 rounded-lg p-3 bg-slate-50/60 hover:bg-slate-50 transition shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-800 text-[12px]">
                        Milestone {mIdx + 1}
                      </strong>
                    </div>
                    <div className="grid grid-cols-6 gap-2 mt-2">
                      <div className="col-span-4">
                        <label className="block text-sm text-slate-700 text-[11px]">
                          Name
                        </label>
                        <input
                          className="form-control rounded-md border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition px-2 py-1 text-[11px]"
                          value={m.name}
                          onChange={(e) =>
                            updateMilestone(mIdx, "name", e.target.value)
                          }
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-sm text-slate-700 text-[11px]">
                          % (0-100)
                        </label>
                        <input
                          className="form-control rounded-md border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition px-2 py-1 text-[11px] text-center"
                          value={m.percentage}
                          onChange={(e) =>
                            handlePercentageChange(mIdx, e.target.value)
                          }
                          placeholder="%"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-sm text-slate-700 text-[11px]">
                          Price
                        </label>
                        <input
                          className="form-control rounded-md border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition px-2 py-1 text-[11px] bg-slate-50 cursor-not-allowed"
                          value={m.price}
                          readOnly
                          title="Price is auto-calculated based on percentage"
                        />
                      </div>
                    </div>
                    {(() => {
                      const totalPercentage = form.milestoneData.reduce(
                        (sum, milestone) =>
                          sum + (parseFloat(milestone.percentage) || 0),
                        0,
                      );
                      return totalPercentage > 100 ? (
                        <div className="text-red-500 text-[10px] mt-1">
                          Warning: Total percentage is{" "}
                          {totalPercentage.toFixed(1)}%. Cannot exceed 100%.
                        </div>
                      ) : null;
                    })()}
                    <div className="mt-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-700 text-[11px]">
                            Parameters
                          </span>
                          <button
                            className="p-1 hover:bg-slate-200 rounded transition"
                            onClick={() =>
                              setEditingParams((prev) => ({
                                ...prev,
                                [mIdx]: !prev[mIdx],
                              }))
                            }
                            title={
                              editingParams[mIdx]
                                ? "Disable editing"
                                : "Enable editing"
                            }
                          >
                            <Edit3
                              size={12}
                              className={
                                editingParams[mIdx]
                                  ? "text-indigo-600"
                                  : "text-slate-400"
                              }
                            />
                          </button>
                        </div>
                        <button
                          className="btn btn-sm btn-secondary rounded-md shadow hover:shadow-md hover:opacity-90 transition px-2 py-1 text-[11px]"
                          onClick={() => addParameter(mIdx)}
                        >
                          Add Parameter
                        </button>
                      </div>
                      <div className="space-y-2 mt-2">
                        {Array.isArray(m.parametersData) &&
                          m.parametersData
                            .filter((p) => p != null)
                            .map((p, pIdx) => (
                              <div
                                key={pIdx}
                                className="flex gap-2 items-start"
                                draggable
                                onDragStart={(e) => (dragItem.current = pIdx)}
                                onDragEnter={(e) =>
                                  (dragOverItem.current = pIdx)
                                }
                                onDragEnd={() => handleSortParameter(mIdx)}
                                onDragOver={(e) => e.preventDefault()}
                              >
                                <div className="cursor-move text-gray-400 hover:text-gray-600 mt-6">
                                  <GripVertical size={16} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <label className="block text-sm text-slate-700 text-[11px]">
                                    Parameter
                                  </label>
                                  {editingParams[mIdx] ? (
                                    <textarea
                                      className="form-control rounded-md border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition px-2 py-1 text-[11px] resize-y min-h-[30px] w-full"
                                      rows={1}
                                      value={p?.parameters || ""}
                                      onChange={(e) =>
                                        updateParameter(
                                          mIdx,
                                          pIdx,
                                          "parameters",
                                          e.target.value,
                                        )
                                      }
                                      style={{ overflow: "hidden" }}
                                      onInput={(e) => {
                                        e.target.style.height = "auto";
                                        e.target.style.height =
                                          e.target.scrollHeight + "px";
                                      }}
                                    />
                                  ) : (
                                    <div
                                      className="form-control rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] min-h-[30px] text-slate-600 break-words whitespace-pre-wrap"
                                      style={{
                                        minHeight:
                                          p?.parameters?.length > 50
                                            ? "auto"
                                            : "30px",
                                        height: "auto",
                                      }}
                                    >
                                      {p?.parameters ||
                                        "No parameter specified"}
                                    </div>
                                  )}
                                </div>
                                <div
                                  className="flex-shrink-0"
                                  style={{
                                    minWidth:
                                      p?.no_of_words?.length > 10
                                        ? "140px"
                                        : "120px",
                                  }}
                                >
                                  <label className="block text-sm text-slate-700 text-[11px]">
                                    No. of Words
                                  </label>
                                  {editingParams[mIdx] ? (
                                    <input
                                      className="form-control rounded-md border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition px-2 py-1 text-[11px] w-full"
                                      value={p?.no_of_words || ""}
                                      onChange={(e) =>
                                        updateParameter(
                                          mIdx,
                                          pIdx,
                                          "no_of_words",
                                          e.target.value,
                                        )
                                      }
                                    />
                                  ) : (
                                    <div className="form-control rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] text-slate-600 break-words">
                                      {p?.no_of_words || "N/A"}
                                    </div>
                                  )}
                                </div>
                                <div
                                  className="flex-shrink-0"
                                  style={{
                                    minWidth:
                                      p?.time_frame?.length > 10
                                        ? "140px"
                                        : "120px",
                                  }}
                                >
                                  <label className="block text-sm text-slate-700 text-[11px]">
                                    Time Frame
                                  </label>
                                  {editingParams[mIdx] ? (
                                    <input
                                      className="form-control rounded-md border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition px-2 py-1 text-[11px] w-full"
                                      value={p?.time_frame || ""}
                                      onChange={(e) =>
                                        updateParameter(
                                          mIdx,
                                          pIdx,
                                          "time_frame",
                                          e.target.value,
                                        )
                                      }
                                    />
                                  ) : (
                                    <div className="form-control rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] text-slate-600 break-words">
                                      {p?.time_frame || "N/A"}
                                    </div>
                                  )}
                                </div>
                                {pIdx > 0 && (
                                  <div className="flex-shrink-0 mt-6">
                                    <button
                                      className="btn btn-sm btn-outline-danger rounded-md hover:shadow-sm transition px-2 py-1 text-[11px]"
                                      onClick={() =>
                                        removeParameter(mIdx, pIdx)
                                      }
                                    >
                                      -
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Remarks - Only show if remarks exist */}
            {form.remarks && form.remarks.trim() !== "" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 text-[11px]">
                  Remarks
                </label>
                <textarea
                  className="form-control rounded-md border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition px-2 py-1 text-[11px]"
                  rows={3}
                  value={form.remarks}
                  onChange={(e) => updateField("remarks", e.target.value)}
                />
              </div>
            )}

            {/* Terms & Conditions - Read-only display */}
            {form.tandc && form.tandc.trim() !== "" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 text-[11px]">
                  Terms & Conditions
                </label>
                <div
                  className="mt-1 p-2 bg-slate-50 border border-slate-200 rounded-md text-[11px] max-h-40 overflow-y-auto prose prose-sm"
                  dangerouslySetInnerHTML={{ __html: form.tandc }}
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 mt-4">
            <button
              className="btn btn-success rounded-md shadow hover:shadow-lg hover:opacity-95 transition px-3 py-1.5 text-[11px]"
              onClick={save}
            >
              Save
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDetailsEditModal;
