"use client";

import { useMemo, useState } from "react";

export default function Home() {
  const [title, setTitle] = useState("");
  const [previewMode, setPreviewMode] = useState(false);

  const breadcrumbTitle = useMemo(() => title.trim() || "Untitled", [title]);

  const onStartFromScratch = () => {
    setTitle((current) => current || "Untitled form");
  };

  const onUseTemplate = () => {
    window.alert("Template picker will open in the full product experience.");
  };

  const onCustomize = () => {
    window.alert("Customization panel will open in the full product experience.");
  };

  const onPublish = () => {
    window.alert("Publish flow will open in the full product experience.");
  };

  return (
    <div className="editor-shell">
      <nav className="top-nav" aria-label="Form navigation">
        <div className="crumbs">
          <span className="logo-mark" aria-hidden="true">
            ✳
          </span>
          <span className="crumb-sep" aria-hidden="true">
            &gt;
          </span>
          <span className="crumb-text">My workspace</span>
          <span className="crumb-sep" aria-hidden="true">
            &gt;
          </span>
          <button className="title-crumb" type="button" onClick={() => document.getElementById("form-title")?.focus()}>
            {breadcrumbTitle}
          </button>
        </div>

        <div className="nav-actions">
          <span className="draft-pill">Draft</span>
          <button type="button" className="icon-button" aria-label="Automations" title="Automations">
            ⚡
          </button>
          <button type="button" className="icon-button" aria-label="Version history" title="Version history">
            ◷
          </button>
          <button type="button" className="icon-button" aria-label="Settings" title="Settings">
            ⚙
          </button>
          <button type="button" className="nav-link nav-link-active" onClick={onCustomize}>
            Customize
          </button>
          <button type="button" className="nav-link nav-link-muted" onClick={() => setPreviewMode((value) => !value)}>
            {previewMode ? "Editor" : "Preview"}
          </button>
          <button type="button" className="nav-link nav-link-muted" onClick={onPublish}>
            Publish
          </button>
        </div>
      </nav>

      <main className="canvas">
        <section className="editor-content">
          <h1
            id="form-title"
            role="textbox"
            aria-label="Form title"
            contentEditable
            suppressContentEditableWarning
            className="form-title"
            data-empty={title.trim() ? "false" : "true"}
            onInput={(event) => setTitle(event.currentTarget.textContent || "")}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                onStartFromScratch();
              }
            }}
          />

          <div className="start-options">
            <button type="button" className="start-option" onClick={onStartFromScratch}>
              <span aria-hidden="true">📄</span>
              <span>Press Enter to start from scratch</span>
            </button>
            <button type="button" className="start-option" onClick={onUseTemplate}>
              <span aria-hidden="true">▦</span>
              <span>Use a template</span>
            </button>
          </div>

          <div className="instructions">
            <p>
              Tally is a form builder that <mark>works like a doc</mark>.
            </p>
            <p>
              Just type <kbd className="kbd-slash">/</kbd> to insert form blocks and <kbd className="kbd-at">@</kbd> to mention
              question answers.
            </p>
          </div>

          <section className="help-grid" aria-label="Help links">
            <div>
              <h2>Get started</h2>
              <ul>
                <li><a href="https://tally.so/help" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">✈</span>Create your first form</a></li>
                <li><a href="https://tally.so/templates" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">▦</span>Get started with templates</a></li>
                <li><a href="https://tally.so/help/embed-a-form" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">◫</span>Embed your form</a></li>
                <li><a href="https://tally.so/help" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">?</span>Help center</a></li>
                <li><a href="https://tally.so/pricing" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">⚡</span>Learn about Tally Pro</a></li>
              </ul>
            </div>

            <div>
              <h2>How-to guides</h2>
              <ul>
                <li><a href="https://tally.so/help/conditional-logic" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">⑂</span>Conditional logic</a></li>
                <li><a href="https://tally.so/help/calculator" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">÷</span>Calculator</a></li>
                <li><a href="https://tally.so/help/hidden-fields" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">◌</span>Hidden fields</a></li>
                <li><a href="https://tally.so/help/mentions" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">@</span>Mentions</a></li>
                <li><a href="https://tally.so/help/payments" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">$</span>Collect payments</a></li>
              </ul>
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}
