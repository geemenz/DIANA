"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type BlockType =
  | "paragraph"
  | "short_answer"
  | "long_answer"
  | "multiple_choice"
  | "checkboxes"
  | "dropdown"
  | "multi_select"
  | "number"
  | "email"
  | "phone";

type Block = {
  id: string;
  type: BlockType;
  label: string;
  value?: string;
  options?: string[];
};

type MenuState = {
  blockId: string;
  x: number;
  y: number;
};

const MENU_ITEMS: Array<{ type: BlockType; icon: string; label: string }> = [
  { type: "short_answer", icon: "≡", label: "Short answer" },
  { type: "long_answer", icon: "☰", label: "Long answer" },
  { type: "multiple_choice", icon: "◉", label: "Multiple choice" },
  { type: "checkboxes", icon: "☑", label: "Checkboxes" },
  { type: "dropdown", icon: "∨", label: "Dropdown" },
  { type: "multi_select", icon: "✓✓", label: "Multi-select" },
  { type: "number", icon: "#", label: "Number" },
  { type: "email", icon: "@", label: "Email" },
  { type: "phone", icon: "📞", label: "Phone number" },
];

let idCounter = 1;

function newId() {
  idCounter += 1;
  return `block-${idCounter}`;
}

function makeBlock(type: BlockType): Block {
  if (type === "paragraph") {
    return { id: newId(), type, label: "" };
  }
  if (["multiple_choice", "checkboxes", "multi_select", "dropdown"].includes(type)) {
    return { id: newId(), type, label: "", options: ["Option 1", "Option 2"] };
  }
  return { id: newId(), type, label: "", value: "" };
}

export default function Home() {
  const [blocks, setBlocks] = useState<Block[]>([{ id: "block-1", type: "paragraph", label: "" }]);
  const [menu, setMenu] = useState<MenuState | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const focusBlockIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!focusBlockIdRef.current) {
      return;
    }
    const el = document.querySelector<HTMLElement>(`[data-block-id='${focusBlockIdRef.current}'] .editable-target`);
    el?.focus();
    focusBlockIdRef.current = null;
  }, [blocks]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!menu) {
        return;
      }
      const target = event.target as Node;
      if (menuRef.current?.contains(target)) {
        return;
      }
      setMenu(null);
    };

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenu(null);
      }
    };

    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onEscape);
    return () => {
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onEscape);
    };
  }, [menu]);

  const insertParagraphBelow = (index: number) => {
    const next = makeBlock("paragraph");
    setBlocks((current) => [...current.slice(0, index + 1), next, ...current.slice(index + 1)]);
    focusBlockIdRef.current = next.id;
  };

  const removeBlock = (index: number) => {
    if (blocks.length === 1) {
      setBlocks([makeBlock("paragraph")]);
      return;
    }
    const prev = blocks[index - 1] ?? blocks[index + 1];
    setBlocks((current) => current.filter((_, i) => i !== index));
    if (prev) {
      focusBlockIdRef.current = prev.id;
    }
  };

  const updateBlock = (id: string, updater: (block: Block) => Block) => {
    setBlocks((current) => current.map((block) => (block.id === id ? updater(block) : block)));
  };

  const openSlashMenu = (event: React.KeyboardEvent<HTMLElement>, blockId: string) => {
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    setMenu({ blockId, x: rect.left + window.scrollX, y: rect.bottom + window.scrollY + 8 });
  };

  const applyMenuItem = (type: BlockType) => {
    if (!menu) {
      return;
    }
    updateBlock(menu.blockId, (block) => {
      const next = makeBlock(type);
      return { ...next, id: block.id };
    });
    setMenu(null);
    focusBlockIdRef.current = menu.blockId;
  };

  const onBlockKeyDown = (event: React.KeyboardEvent<HTMLElement>, block: Block, index: number) => {
    if (event.key === "/") {
      openSlashMenu(event, block.id);
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      insertParagraphBelow(index);
      return;
    }
    if (event.key === "Backspace") {
      const value = event.currentTarget.textContent?.trim() ?? "";
      if (!value && (!block.options || block.options.every((option) => !option.trim()))) {
        event.preventDefault();
        removeBlock(index);
      }
    }
  };

  const orderedBlocks = useMemo(() => blocks, [blocks]);

  return (
    <main className="builder-canvas">
      <section className="block-editor" aria-label="Form block editor">
        {orderedBlocks.map((block, index) => (
          <div key={block.id}>
            {dropIndex === index ? <div className="drop-indicator" /> : null}
            <div
              className="block-row"
              data-block-id={block.id}
              onDragOver={(event) => {
                event.preventDefault();
                const rect = event.currentTarget.getBoundingClientRect();
                const insertAfter = event.clientY > rect.top + rect.height / 2;
                setDropIndex(insertAfter ? index + 1 : index);
              }}
              onDrop={(event) => {
                event.preventDefault();
                if (!draggedId || dropIndex === null) {
                  return;
                }
                const from = orderedBlocks.findIndex((entry) => entry.id === draggedId);
                if (from < 0) {
                  return;
                }
                const draft = [...orderedBlocks];
                const [moved] = draft.splice(from, 1);
                const target = dropIndex > from ? dropIndex - 1 : dropIndex;
                draft.splice(target, 0, moved);
                setBlocks(draft);
                setDraggedId(null);
                setDropIndex(null);
              }}
            >
              <div className="block-tools" aria-hidden="true">
                <button type="button" onClick={() => removeBlock(index)} title="Delete block">
                  🗑
                </button>
                <button type="button" onClick={() => insertParagraphBelow(index)} title="Add block below">
                  ＋
                </button>
                <button
                  type="button"
                  title="Drag block"
                  draggable
                  onDragStart={() => setDraggedId(block.id)}
                  onDragEnd={() => {
                    setDraggedId(null);
                    setDropIndex(null);
                  }}
                >
                  ⠿
                </button>
                <span>/</span>
              </div>

              <article className="block-content">
                {block.type !== "paragraph" ? (
                  <div
                    role="textbox"
                    contentEditable
                    suppressContentEditableWarning
                    className="question-label editable-target"
                    data-empty={block.label.trim() ? "false" : "true"}
                    onInput={(event) => updateBlock(block.id, (entry) => ({ ...entry, label: event.currentTarget.textContent || "" }))}
                    onKeyDown={(event) => onBlockKeyDown(event, block, index)}
                  />
                ) : null}

                {(block.type === "paragraph" || block.type === "short_answer" || block.type === "number" || block.type === "email" || block.type === "phone") && (
                  <div className="answer-line-wrap">
                    {block.type === "number" ? <span className="prefix-icon">#</span> : null}
                    {block.type === "email" ? <span className="prefix-icon">@</span> : null}
                    {block.type === "phone" ? <span className="prefix-icon">📞</span> : null}
                    <div
                      role="textbox"
                      contentEditable
                      suppressContentEditableWarning
                      className="answer-line editable-target"
                      data-empty={block.value?.trim() || block.label.trim() ? "false" : "true"}
                      data-placeholder={
                        block.type === "short_answer"
                          ? "Short answer..."
                          : block.type === "number"
                            ? "Number..."
                            : block.type === "email"
                              ? "Email..."
                              : block.type === "phone"
                                ? "Phone number..."
                                : "Type / for commands"
                      }
                      onInput={(event) =>
                        updateBlock(block.id, (entry) =>
                          entry.type === "paragraph"
                            ? { ...entry, label: event.currentTarget.textContent || "" }
                            : { ...entry, value: event.currentTarget.textContent || "" },
                        )
                      }
                      onKeyDown={(event) => onBlockKeyDown(event, block, index)}
                    />
                  </div>
                )}

                {block.type === "long_answer" && (
                  <div
                    role="textbox"
                    contentEditable
                    suppressContentEditableWarning
                    className="answer-long editable-target"
                    data-empty={block.value?.trim() ? "false" : "true"}
                    data-placeholder="Long answer..."
                    onInput={(event) => updateBlock(block.id, (entry) => ({ ...entry, value: event.currentTarget.textContent || "" }))}
                    onKeyDown={(event) => onBlockKeyDown(event, block, index)}
                  />
                )}

                {["multiple_choice", "checkboxes", "multi_select", "dropdown"].includes(block.type) && (
                  <div className="choice-group">
                    {(block.options || []).map((option, optionIndex) => (
                      <div key={`${block.id}-${optionIndex}`} className="choice-row">
                        <span className="choice-symbol" aria-hidden="true">
                          {block.type === "multiple_choice" ? "○" : block.type === "dropdown" ? "∨" : "☐"}
                        </span>
                        <div
                          role="textbox"
                          contentEditable
                          suppressContentEditableWarning
                          className="choice-text"
                          data-empty={option.trim() ? "false" : "true"}
                          onInput={(event) =>
                            updateBlock(block.id, (entry) => ({
                              ...entry,
                              options: (entry.options || []).map((item, idx) =>
                                idx === optionIndex ? event.currentTarget.textContent || "" : item,
                              ),
                            }))
                          }
                        >
                          {option}
                        </div>
                        <button
                          type="button"
                          className="option-delete"
                          aria-label="Delete option"
                          onClick={() =>
                            updateBlock(block.id, (entry) => ({
                              ...entry,
                              options: (entry.options || []).filter((_, idx) => idx !== optionIndex),
                            }))
                          }
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    {block.type === "dropdown" ? <div className="dropdown-preview">Select an option ∨</div> : null}
                    <button
                      type="button"
                      className="add-option"
                      onClick={() =>
                        updateBlock(block.id, (entry) => ({
                          ...entry,
                          options: [...(entry.options || []), `Option ${(entry.options?.length || 0) + 1}`],
                        }))
                      }
                    >
                      + Add option
                    </button>
                  </div>
                )}
              </article>
            </div>
          </div>
        ))}
        {dropIndex === orderedBlocks.length ? <div className="drop-indicator" /> : null}
      </section>

      {menu ? (
        <div ref={menuRef} className="slash-menu" style={{ left: menu.x, top: menu.y }}>
          <p className="slash-title">Questions</p>
          {MENU_ITEMS.map((item) => (
            <button key={item.type} type="button" className="slash-item" onClick={() => applyMenuItem(item.type)}>
              <span aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      ) : null}
    </main>
  );
}
