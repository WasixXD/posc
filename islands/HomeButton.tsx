import { useEffect } from "preact/hooks";

interface Props {
  uuid: string;
}
export default function HomeButton(props: Props) {
  const { uuid } = props;
  useEffect(() => {
    const handleBeforeUnload = async () => {
      try {
        await fetch(`/api/cleanup?uuid=${uuid}`, {
          method: "DELETE",
          keepalive: true,
        });
      } catch (error) {
        console.warn("Erro ao limpar sessão:", error);
      }
    };

    const handleVisibilityChange = async () => {
      if (document.visibilityState === "hidden") {
        try {
          await fetch(`/api/cleanup?uuid=${uuid}`, {
            method: "DELETE",
            keepalive: true,
          });
        } catch (error) {
          console.warn("Erro ao limpar sessão:", error);
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [uuid]);

  return (
    <div>
      <a
        href="/"
        class="btn btn-primary mt-4"
        onClick={async () => {
          try {
            await fetch(`/api/cleanup?uuid=${uuid}`, { method: "DELETE" });
          } catch (error) {
            console.warn("Erro ao limpar sessão:", error);
          }
        }}
      >
        Home
      </a>
    </div>
  );
}
