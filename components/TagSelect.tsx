import { useEffect, useRef, useState } from "preact/hooks";
import { type Tag } from "../routes/api/list/tag.ts";

export default function TagSelect({
  initialTags = [],
  name,
  maxTags = 10,
}: {
  initialTags?: Tag[];
  name: string;
  maxTags?: number;
}) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState<Tag[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filtra opções baseado no input
  useEffect(() => {
    if (!input.trim()) {
      setFilteredOptions(
        initialTags.filter((tag) => !selectedTags.includes(tag.name)),
      );
    } else {
      const filtered = initialTags.filter((tag) =>
        tag.name.toLowerCase().includes(input.toLowerCase()) &&
        !selectedTags.includes(tag.name)
      );
      setFilteredOptions(filtered);
    }
    setHighlightedIndex(-1);
  }, [input, selectedTags, initialTags]);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addTag = (tagName: string) => {
    const trimmedTag = tagName.trim();
    if (
      !trimmedTag || selectedTags.includes(trimmedTag) ||
      selectedTags.length >= maxTags
    ) {
      return;
    }

    setSelectedTags([...selectedTags, trimmedTag]);
    setInput("");
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const removeTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter((tag) => tag !== tagToRemove));
    inputRef.current?.focus();
  };

  const handleInputChange = (e: Event) => {
    const value = (e.target as HTMLInputElement).value;
    setInput(value);
    setIsOpen(value.length > 0 || filteredOptions.length > 0);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          addTag(filteredOptions[highlightedIndex].name);
        } else if (input.trim()) {
          // Adiciona nova tag se não existir nas opções
          addTag(input.trim());
        }
        break;

      case "ArrowDown":
        e.preventDefault();
        if (!isOpen) setIsOpen(true);
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;

      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => prev > 0 ? prev - 1 : -1);
        break;

      case "Escape":
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;

      case "Backspace":
        if (!input && selectedTags.length > 0) {
          removeTag(selectedTags[selectedTags.length - 1]);
        }
        break;

      case "Tab":
        if (isOpen && highlightedIndex >= 0) {
          e.preventDefault();
          addTag(filteredOptions[highlightedIndex].name);
        }
        break;
    }
  };

  const handleInputFocus = () => {
    setIsOpen(filteredOptions.length > 0 || input.length > 0);
  };

  // Verifica se o input atual seria uma nova tag
  const isNewTag = input.trim() &&
    !filteredOptions.some((option) =>
      option.name.toLowerCase() === input.toLowerCase()
    );

  return (
    <div class="dropdown w-full" ref={dropdownRef}>
      {/* Input oculto para o formulário */}
      <input
        type="hidden"
        name={name}
        value={selectedTags.join(",")}
      />

      <div class="input input-bordered w-full min-h-[3rem] h-auto p-2 flex flex-wrap gap-2 items-center cursor-text focus-within:outline-offset-2 focus-within:outline-2 focus-within:outline-primary">
        {selectedTags.map((tag) => (
          <div
            key={tag}
            class="badge badge-soft badge-accent rounded-full gap-2 px-3 py-2"
          >
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(tag)}
              class="flex items-center justify-center p-0 min-h-0 h-3 w-3 rounded-full opacity-70 hover:opacity-100 transition-opacity bg-transparent border-0 hover:bg-transparent"
              aria-label={`Remove ${tag}`}
            >
              ✕
            </button>
          </div>
        ))}

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onInput={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          placeholder={selectedTags.length === 0
            ? "Type to search or create tags..."
            : ""}
          class="flex-1 min-w-[120px] outline-none bg-transparent input-ghost p-0 border-0 focus:outline-none"
          disabled={selectedTags.length >= maxTags}
        />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div class="dropdown-content menu bg-base-100 rounded-box z-50 w-full p-2 shadow-lg border border-base-300 mt-1 max-h-60 overflow-y-auto">
          {/* Opções existentes */}
          {filteredOptions.map((option, index) => (
            <li key={option.tag_id}>
              <button
                type="button"
                onClick={() => addTag(option.name)}
                class={`flex justify-between items-center ${
                  highlightedIndex === index ? "active" : ""
                }`}
              >
                <span>{option.name}</span>
                <div class="badge badge-ghost badge-sm">existing</div>
              </button>
            </li>
          ))}

          {/* Opção para criar nova tag */}
          {isNewTag && (
            <li>
              <button
                type="button"
                onClick={() => addTag(input)}
                class={`flex justify-between items-center border-t border-base-300 ${
                  highlightedIndex === filteredOptions.length ? "active" : ""
                }`}
              >
                <span>Create "{input}"</span>
                <div class="badge badge-success badge-sm">new</div>
              </button>
            </li>
          )}

          {/* Mensagem quando não há opções */}
          {filteredOptions.length === 0 && !isNewTag && (
            <li class="disabled">
              <span class="text-base-content/70">
                {input ? "No tags found" : "Type to search for tags"}
              </span>
            </li>
          )}
        </div>
      )}

      {/* Contador de tags */}
      {maxTags && (
        <div class="label">
          <span class="label-text-alt">
            {selectedTags.length}/{maxTags} tags
          </span>
        </div>
      )}
    </div>
  );
}
