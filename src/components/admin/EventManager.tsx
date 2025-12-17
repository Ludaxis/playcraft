'use client';

import React from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useAdmin } from '@/store';
import { allEvents } from '@/config/adminDefaults';

// Sortable Event Item
function SortableEventItem({
  id,
  name,
  onRemove
}: {
  id: string;
  name: string;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 bg-bg-card rounded-lg p-2 border border-border cursor-grab active:cursor-grabbing"
      {...attributes}
      {...listeners}
    >
      <div className="w-5 h-5 bg-bg-muted rounded flex items-center justify-center">
        <span className="text-text-muted text-mini">::</span>
      </div>
      <span className="flex-1 text-text-primary font-bold text-xs truncate">{name}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        onPointerDown={(e) => e.stopPropagation()}
        className="w-5 h-5 bg-status-error rounded flex items-center justify-center"
      >
        <span className="text-text-inverse text-mini font-bold">x</span>
      </button>
    </div>
  );
}

// Droppable Column
function DroppableColumn({
  id,
  title,
  count,
  maxCount,
  children
}: {
  id: string;
  title: string;
  count: number;
  maxCount: number;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div className="flex-1">
      <p className="text-text-primary text-value mb-2 text-center">{title} ({count}/{maxCount})</p>
      <div
        ref={setNodeRef}
        className={`space-y-1 min-h-[200px] rounded-lg p-2 transition-colors ${
          isOver ? 'bg-brand-primary/30' : 'bg-bg-muted'
        }`}
      >
        {children}
      </div>
    </div>
  );
}

// Drag overlay item
function DragOverlayItem({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-2 bg-bg-card rounded-lg p-2 border-2 border-border-strong shadow-lg">
      <div className="w-5 h-5 bg-bg-muted rounded flex items-center justify-center">
        <span className="text-text-muted text-mini">::</span>
      </div>
      <span className="flex-1 text-text-primary font-bold text-xs">{name}</span>
    </div>
  );
}

export function EventManager() {
  const { config, toggleEvent, updateEventPlacement } = useAdmin();
  const [activeId, setActiveId] = React.useState<string | null>(null);

  const leftEvents = config.eventPlacement?.left || [];
  const rightEvents = config.eventPlacement?.right || [];

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const disabledEvents = allEvents.filter(
    event => !leftEvents.includes(event.id) && !rightEvents.includes(event.id)
  );

  const getEventName = (id: string) => allEvents.find(e => e.id === id)?.name || id;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Determine source and destination
    const isInLeft = leftEvents.includes(activeId);
    const isInRight = rightEvents.includes(activeId);

    let newLeft = [...leftEvents];
    let newRight = [...rightEvents];

    // Handle dropping on a column directly
    if (overId === 'left-column') {
      if (isInRight && newLeft.length < 5) {
        newRight = newRight.filter(id => id !== activeId);
        newLeft = [...newLeft, activeId];
      }
    } else if (overId === 'right-column') {
      if (isInLeft && newRight.length < 5) {
        newLeft = newLeft.filter(id => id !== activeId);
        newRight = [...newRight, activeId];
      }
    } else {
      // Dropping on another item
      const overInLeft = leftEvents.includes(overId);
      const overInRight = rightEvents.includes(overId);

      if (isInLeft && overInLeft) {
        // Reorder within left
        const oldIndex = newLeft.indexOf(activeId);
        const newIndex = newLeft.indexOf(overId);
        newLeft.splice(oldIndex, 1);
        newLeft.splice(newIndex, 0, activeId);
      } else if (isInRight && overInRight) {
        // Reorder within right
        const oldIndex = newRight.indexOf(activeId);
        const newIndex = newRight.indexOf(overId);
        newRight.splice(oldIndex, 1);
        newRight.splice(newIndex, 0, activeId);
      } else if (isInLeft && overInRight && newRight.length < 5) {
        // Move from left to right
        newLeft = newLeft.filter(id => id !== activeId);
        const newIndex = newRight.indexOf(overId);
        newRight.splice(newIndex, 0, activeId);
      } else if (isInRight && overInLeft && newLeft.length < 5) {
        // Move from right to left
        newRight = newRight.filter(id => id !== activeId);
        const newIndex = newLeft.indexOf(overId);
        newLeft.splice(newIndex, 0, activeId);
      }
    }

    updateEventPlacement({ left: newLeft, right: newRight });
  };

  const removeEvent = (eventId: string) => {
    const newLeft = leftEvents.filter(id => id !== eventId);
    const newRight = rightEvents.filter(id => id !== eventId);
    updateEventPlacement({ left: newLeft, right: newRight });
  };

  const addEvent = (eventId: string) => {
    if (leftEvents.length < 5) {
      updateEventPlacement({
        left: [...leftEvents, eventId],
        right: rightEvents
      });
    } else if (rightEvents.length < 5) {
      updateEventPlacement({
        left: leftEvents,
        right: [...rightEvents, eventId]
      });
    }
  };

  const activeEvent = activeId ? allEvents.find(e => e.id === activeId) : null;

  return (
    <div className="space-y-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-2">
          {/* Left Column */}
          <DroppableColumn id="left-column" title="Left" count={leftEvents.length} maxCount={5}>
            <SortableContext items={leftEvents} strategy={verticalListSortingStrategy}>
              {leftEvents.length === 0 ? (
                <p className="text-text-muted text-xs py-4 text-center">Drag events here</p>
              ) : (
                leftEvents.map((eventId) => (
                  <SortableEventItem
                    key={eventId}
                    id={eventId}
                    name={getEventName(eventId)}
                    onRemove={() => removeEvent(eventId)}
                  />
                ))
              )}
            </SortableContext>
          </DroppableColumn>

          {/* Right Column */}
          <DroppableColumn id="right-column" title="Right" count={rightEvents.length} maxCount={5}>
            <SortableContext items={rightEvents} strategy={verticalListSortingStrategy}>
              {rightEvents.length === 0 ? (
                <p className="text-text-muted text-xs py-4 text-center">Drag events here</p>
              ) : (
                rightEvents.map((eventId) => (
                  <SortableEventItem
                    key={eventId}
                    id={eventId}
                    name={getEventName(eventId)}
                    onRemove={() => removeEvent(eventId)}
                  />
                ))
              )}
            </SortableContext>
          </DroppableColumn>
        </div>

        <DragOverlay>
          {activeEvent ? <DragOverlayItem name={activeEvent.name} /> : null}
        </DragOverlay>
      </DndContext>

      {/* Available Events */}
      {disabledEvents.length > 0 && (
        <div>
          <p className="text-text-primary text-value mb-2">Available Events</p>
          <div className="flex flex-wrap gap-2">
            {disabledEvents.map((event) => (
              <button
                key={event.id}
                onClick={() => addEvent(event.id)}
                disabled={leftEvents.length >= 5 && rightEvents.length >= 5}
                className="flex items-center gap-1 bg-bg-card rounded-full px-3 py-1.5 border border-border disabled:opacity-30"
              >
                <span className="text-text-primary text-value-sm">{event.name}</span>
                <span className="text-status-success text-value-sm">+</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
