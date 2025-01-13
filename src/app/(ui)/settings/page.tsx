"use client";
import { useEffect, useState } from "react";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/shared/components/ui/select";
import { clientApiClient } from "@/services/apiClient";
import { Settings } from "@/types/user";
import { Textarea } from "@/shared/components/ui/textarea";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useToast } from "@/shared/hooks/use-toast"
import { useTranslations } from "next-intl";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/ui/accordion"


// Предопределённый список ID
const availableIds = [
  { label: "GPT 4o mini", value: "gpt-4o-mini" },
  { label: "GPT 4o", value: "gpt-4o" },
];

export default function OrganizationSettings() {
  const t = useTranslations("app.(ui).settings");
  const { toast } = useToast();
  const [settings, setSettings] = useState<Settings | null>(null); // Для отображения скелетона
  const [isNewSettings, setIsNewSettings] = useState(true); // Флаг для нового объекта
  const [loading, setLoading] = useState(true); // Флаг загрузки

  // Получение настроек с сервера
  const fetchSettings = async (): Promise<void> => {
    try {
      const response = await clientApiClient.get<Settings>("/settings/");
      if (response.data) {
        setSettings(response.data);
        setIsNewSettings(false);
      }
    } catch (error) {
      console.error("Ошибка при получении настроек:", error);
    } finally {
      setLoading(false);
    }
  };

  // Сохранение данных
  const saveSettings = async (): Promise<void> => {
    if (!settings) return;

    try {
      if (isNewSettings) {
        await clientApiClient.post("/settings/", settings);
        toast({
          title: t("saveMessageHeader"),
          description: t("saveMessageBody"),

        });
        setIsNewSettings(false);
      } else {
        await clientApiClient.patch("/settings/", settings);
        toast({
          title: t("updateMessageHeader"),
          description: t("updateMessageBody"),

        });
      }
    } catch (error) {
      console.error("Ошибка при сохранении настроек:", error);

      toast({
        title: t("error.data"),
        description: t("error.saveData"),
        variant: "destructive"

      });
    }
  };

  // Обновление значений
  const handleChange = <T extends keyof Settings>(field: T, value: Settings[T]): void => {
    if (!settings) return;
    setSettings((prev) => ({ ...prev!, [field]: value }));
  };

  // Загрузка данных при монтировании
  useEffect(() => {
    fetchSettings();
  }, []);

  // Скелетон для отображения загрузки
  if (loading || !settings) {
    return (
      <div className="container mx-auto p-4">
        <h2 className="text-2xl font-bold mb-6">{t("settings")}</h2>
        <Skeleton className="h-6 w-1/2 mb-4" />
        <Skeleton className="h-12 w-full mb-4" />
        <Skeleton className="h-6 w-1/3 mb-4" />
        <Skeleton className="h-12 w-full mb-4" />
        <Skeleton className="h-6 w-1/4 mb-4" />
        <Skeleton className="h-12 w-full mb-4" />
      </div>
    );
  }

  return (
    <div className="flex items-center h-full">
      <div className="container mx-auto p-4">
        <h2 className="text-2xl font-bold mb-4">{t("settings")} </h2>


        {/* Organization Name */}
        <div>

          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger><label className="block text-sm font-medium mb-2">{t("systemPrompt")}</label></AccordionTrigger>
              <AccordionContent>
                {t("helpText.systemPromptText")}
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Textarea
            placeholder={t("prompt")}
            value={settings.text}
            onChange={(e) => handleChange("text", e.target.value)}
          />

        </div>

        {/* Organization ID */}
        <div>


          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger><label className="block text-sm font-medium mb-2">{t("aiModel")}</label></AccordionTrigger>
              <AccordionContent>
                {t("helpText.aiModelHelp")}
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Select
            value={settings.model_id}
            onValueChange={(value) => handleChange("model_id", value)}
          >
            <SelectTrigger className="w-full">
              {settings.model_id || t("aiModelSelect")}
            </SelectTrigger>
            <SelectContent>
              {availableIds.map((id) => (
                <SelectItem key={id.value} value={id.value}>
                  {id.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Temperature */}
        <div>


          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger><label className="block text-sm font-medium mb-2">{t("temperature")}</label></AccordionTrigger>
              <AccordionContent>
                {t("helpText.temperatureHelp")}
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Input
            type="number"
            value={settings.temperature}
            onChange={(e) => handleChange("temperature", parseFloat(e.target.value))}
          />
        </div>

        {/* Max Tokens */}
        <div>



          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger> <label className="block text-sm font-medium mb-2">{t("maxTokens")} </label>
              </AccordionTrigger>
              <AccordionContent>
                {t("helpText.maxTokensHelp")}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <Input
            type="number"
            value={settings.max_tokens}
            onChange={(e) => handleChange("max_tokens", parseInt(e.target.value))}
          />
        </div>

        {/* Active */}
        <div className="flex items-center space-x-4">
          <Checkbox
            checked={settings.active}
            onCheckedChange={(value) => handleChange("active", value)}
          />

          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger> <label className="text-sm font-medium">{t("active")}</label>
              </AccordionTrigger>
              <AccordionContent>
                {t("helpText.activeHelp")}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Full Manual Mode */}
        <div className="flex items-center space-x-4">
          <Checkbox
            checked={settings.full_manual_mode}
            onCheckedChange={(value) => handleChange("full_manual_mode", value)}
          />


          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger> <label className="text-sm font-medium">{t("manualMode")}</label>
              </AccordionTrigger>
              <AccordionContent>
                {t("helpText.manualMode")}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Save Button */}
        <div>
          <Button className="w-full" onClick={saveSettings}>
            {t("button.save")}
          </Button>
        </div>
      </div>
    </div>
  );
}
