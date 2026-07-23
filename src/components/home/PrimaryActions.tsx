import { Link } from "@tanstack/react-router";
import { Swords, Dice5 } from "lucide-react";
import { toast } from "sonner";
import { useT } from "@/lib/i18n";

export function PrimaryActions() {
  const t = useT();
  return (
    <div className="flex gap-2.5">
      <button
        onClick={() => toast(t("actions.liveSoon"), { description: t("actions.liveSoon.desc") })}
        className="flex flex-[55] items-center justify-center gap-2 rounded-[14px] bg-primary py-3.5 text-[14px] font-semibold text-primary-foreground shadow-sm active:scale-[0.99]"
      >
        <Swords className="h-[18px] w-[18px]" />
        {t("actions.findOpponent")}
      </button>
      <Link
        to="/training"
        className="flex flex-[45] items-center justify-center gap-2 rounded-[14px] bg-white hairline py-3.5 text-[14px] font-semibold text-foreground active:scale-[0.99]"
      >
        <Dice5 className="h-[18px] w-[18px]" />
        {t("actions.training")}
      </Link>
    </div>
  );
}
