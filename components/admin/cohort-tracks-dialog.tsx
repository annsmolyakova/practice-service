"use client";

import { FormEvent, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { tracksApi } from "@/lib/practice-api";
import type { Cohort, CohortTrack } from "@/types/api";

type CohortTracksDialogProps = {
  cohort: Cohort;
  onClose: () => void;
};

export default function CohortTracksDialog({ cohort, onClose }: CohortTracksDialogProps) {
  const [tracks, setTracks] = useState<CohortTrack[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [formError, setFormError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isCancelled = false;

    tracksApi
      .listByCohort(cohort.id)
      .then((response) => {
        if (!isCancelled) {
          setTracks([...response.items].sort((left, right) => left.sortOrder - right.sortOrder));
          setLoadError("");
        }
      })
      .catch((error: unknown) => {
        if (!isCancelled) {
          setLoadError(error instanceof Error ? error.message : "Не удалось загрузить треки");
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [cohort.id, reloadKey]);

  function retryLoading() {
    setIsLoading(true);
    setLoadError("");
    setReloadKey((current) => current + 1);
  }

  async function createTrack(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedTitle = title.trim();
    const normalizedDescription = description.trim();

    if (!normalizedTitle) {
      setFormError("Введите название трека");
      return;
    }

    if (normalizedTitle.length > 255) {
      setFormError("Название не должно превышать 255 символов");
      return;
    }

    if (normalizedDescription.length > 2000) {
      setFormError("Описание не должно превышать 2000 символов");
      return;
    }

    setIsSaving(true);
    setFormError("");

    try {
      const response = await tracksApi.create(cohort.id, {
        title: normalizedTitle,
        ...(normalizedDescription ? { description: normalizedDescription } : {}),
        sortOrder: tracks.length,
        isActive: true,
      });

      setTracks((current) =>
        [...current, response.track].sort((left, right) => left.sortOrder - right.sortOrder),
      );
      setTitle("");
      setDescription("");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Не удалось создать трек");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && !isSaving && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Треки: {cohort.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <section className="space-y-3">
            <h3 className="font-medium">Созданные треки</h3>

            {isLoading ? (
              <p className="py-4 text-center text-slate-600">Загрузка треков...</p>
            ) : loadError ? (
              <div className="flex items-center justify-between gap-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                <span>{loadError}</span>
                <Button type="button" variant="outline" size="sm" onClick={retryLoading}>
                  Повторить
                </Button>
              </div>
            ) : tracks.length === 0 ? (
              <p className="rounded-lg bg-slate-50 p-4 text-slate-600">
                В когорте пока нет треков.
              </p>
            ) : (
              <div className="space-y-2">
                {tracks.map((track) => (
                  <article key={track.id} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="font-medium">{track.title}</h4>
                      <span className="text-xs text-slate-500">
                        {track.isActive ? "Активен" : "В архиве"}
                      </span>
                    </div>
                    {track.description && (
                      <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">
                        {track.description}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>

          <form className="space-y-4 border-t pt-5" onSubmit={createTrack}>
            <h3 className="font-medium">Новый трек</h3>
            <div>
              <Label htmlFor="track-title">Название</Label>
              <Input
                id="track-title"
                value={title}
                placeholder="Например, Backend-разработка"
                disabled={isSaving}
                onChange={(event) => {
                  setTitle(event.target.value);
                  setFormError("");
                }}
              />
            </div>
            <div>
              <Label htmlFor="track-description">Описание</Label>
              <Textarea
                id="track-description"
                value={description}
                placeholder="Краткое описание трека"
                disabled={isSaving}
                onChange={(event) => {
                  setDescription(event.target.value);
                  setFormError("");
                }}
              />
            </div>

            {formError && <p className="text-sm text-red-600">{formError}</p>}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" disabled={isSaving} onClick={onClose}>
                Закрыть
              </Button>
              <Button type="submit" disabled={isSaving || isLoading || Boolean(loadError)}>
                {isSaving ? "Создание..." : "Создать трек"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
