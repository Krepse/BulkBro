
import React from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
    type DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Icons } from './Icons';

interface SortableItemProps {
    id: string | number;
    children: React.ReactNode;
}

export function SortableItem({ id, children }: SortableItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        position: 'relative' as const,
    };

    return (
        <div ref={setNodeRef} style={style} className={isDragging ? 'opacity-80 scale-[1.02] shadow-xl z-50' : ''}>
            <div className="absolute left-2 top-1/2 -translate-y-1/2 z-20 touch-none p-4 cursor-grab active:cursor-grabbing" {...attributes} {...listeners}>
                <div className="bg-slate-100/50 p-2 rounded-lg hover:bg-slate-200 transition-colors">
                    <Icons.Menu className="w-6 h-6 text-slate-400" />
                </div>
            </div>
            <div className="pl-16">
                {children}
            </div>
        </div>
    );
}

interface SortableListProps {
    items: (string | number)[];
    onReorder: (newOrder: (string | number)[]) => void;
    renderItem: (id: string | number) => React.ReactNode;
}

export function SortableList({ items, onReorder, renderItem }: SortableListProps) {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            // Fix: Coerce to string to ensure matching works regardless of type (number vs string)
            const oldIndex = items.findIndex(id => String(id) === String(active.id));
            const newIndex = items.findIndex(id => String(id) === String(over.id));

            if (oldIndex !== -1 && newIndex !== -1) {
                onReorder(arrayMove(items, oldIndex, newIndex));
            }
        }
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
                items={items}
                strategy={verticalListSortingStrategy}
            >
                <div className="space-y-3">
                    {items.map((id) => (
                        <SortableItem key={id} id={id}>
                            {renderItem(id)}
                        </SortableItem>
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
}
