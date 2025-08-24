import { useState } from "preact/hooks";
import { type Tag } from "../routes/api/list/tag.ts";

export default function TagSelect(
  { initialTags = [], name }: { initialTags?: Tag[]; name: string },
) {
  const [tags, setTags] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [options] = useState(initialTags);

  const addTag = (value: string) => {
    if (!value.trim()) return;
    if (!tags.includes(value) && tags.length < 1) setTags([...tags, value]);
    setInput("");
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      addTag(input.trim());
    }
  };

  return (
    <div class="w-full">
      <input type="hidden" name={name} value={tags.join(",")} />
      <input
        type="text"
        value={input}
        onInput={(e) => setInput((e.target as HTMLInputElement).value)}
        onKeyDown={handleKeyDown}
        placeholder="Digite uma tag..."
        class="input input-bordered w-full"
        list="tag-options"
      />

      <datalist id="tag-options">
        {options.map((opt) => (
          <option
            value={opt.tag_id}
            onClick={() => addTag(opt.name)}
            key={opt.tag_id}
          >
            {opt.name}
          </option>
        ))}
      </datalist>

      <div class="flex flex-wrap gap-2 mb-2">
        {tags.map((tag) => <div class="badge badge-primary">{tag}</div>)}
      </div>
    </div>
  );
}
