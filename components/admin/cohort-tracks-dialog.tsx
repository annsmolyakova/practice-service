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

function getSubmitLabel(isEditing: boolean, isSaving: boolean) {
  if (isSaving) {
    return isEditing ? "Сохранение..." : "Создание...";
  }

  return isEditing ? "Сохранить" : "Создать трек";
}

export default function CohortTracksDialog({ cohort, onClose }: CohortTracksDialogProps) {
  const [tracks, setTracks] = useState<CohortTrack[]>([]);
  const [editingTrack, setEditingTrack] = useState<CohortTrack | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [isActive, setIsActive] = useState(true);
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

  function resetForm() {
    setEditingTrack(null);
    setTitle("");
    setDescription("");
    setSortOrder("0");
    setIsActive(true);
    setFormError("");
  }

  function startEditing(track: CohortTrack) {
    setEditingTrack(track);
    setTitle(track.title);
    setDescription(track.description ?? "");
    setSortOrder(String(track.sortOrder));
    setIsActive(track.isActive);
    setFormError("");
  }

  async function saveTrack(event: FormEvent<HTMLFormElement>) {
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

    const normalizedSortOrder = Number(sortOrder);

    if (
      editingTrack &&
      (!sortOrder.trim() || !Number.isInteger(normalizedSortOrder) || normalizedSortOrder < 0)
    ) {
      setFormError("Порядок должен быть целым неотрицательным числом");
      return;
    }

    setIsSaving(true);
    setFormError("");

    try {
      if (editingTrack) {
        const response = await tracksApi.update(editingTrack.id, {
          title: normalizedTitle,
          description: normalizedDescription || null,
          sortOrder: normalizedSortOrder,
          isActive,
        });

        setTracks((current) =>
          current
            .map((track) => (track.id === response.track.id ? response.track : track))
            .sort((left, right) => left.sortOrder - right.sortOrder),
        );
      } else {
        const nextSortOrder = tracks.reduce(
          (maximum, track) => Math.max(maximum, track.sortOrder + 1),
          0,
        );
        const response = await tracksApi.create(cohort.id, {
          title: normalizedTitle,
          ...(normalizedDescription ? { description: normalizedDescription } : {}),
          sortOrder: nextSortOrder,
          isActive: true,
        });

        setTracks((current) =>
          [...current, response.track].sort((left, right) => left.sortOrder - right.sortOrder),
        );
      }

      resetForm();
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : editingTrack
            ? "Не удалось сохранить трек"
            : "Не удалось создать трек",
      );
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
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">
                          {track.isActive ? "Активен" : "В архиве"}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={isSaving}
                          onClick={() => startEditing(track)}
                        >
                          Редактировать
                        </Button>
                      </div>
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

          <form className="space-y-4 border-t pt-5" onSubmit={saveTrack}>
            <h3 className="font-medium">
              {editingTrack ? `Редактирование: ${editingTrack.title}` : "Новый трек"}
            </h3>
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

            {editingTrack && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="track-sort-order">Порядок</Label>
                  <Input
                    id="track-sort-order"
                    type="number"
                    min="0"
                    step="1"
                    value={sortOrder}
                    disabled={isSaving}
                    onChange={(event) => {
                      setSortOrder(event.target.value);
                      setFormError("");
                    }}
                  />
                </div>

                <label className="flex items-center gap-2 self-end pb-2 text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={isActive}
                    disabled={isSaving}
                    onChange={(event) => {
                      setIsActive(event.target.checked);
                      setFormError("");
                    }}
                  />
                  Активный трек
                </label>
              </div>
            )}

            {formError && <p className="text-sm text-red-600">{formError}</p>}

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={isSaving}
                onClick={editingTrack ? resetForm : onClose}
              >
                {editingTrack ? "Отменить" : "Закрыть"}
              </Button>
              <Button type="submit" disabled={isSaving || isLoading || Boolean(loadError)}>
                {getSubmitLabel(Boolean(editingTrack), isSaving)}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
