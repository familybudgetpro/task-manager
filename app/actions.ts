'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getTasks() {
  return await prisma.task.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function addTask(text: string, remarks: string) {
  const task = await prisma.task.create({
    data: {
      text,
      remarks,
    },
  });
  revalidatePath('/');
  return task;
}

export async function toggleTask(id: string, completed: boolean) {
  const task = await prisma.task.update({
    where: { id },
    data: { completed },
  });
  revalidatePath('/');
  return task;
}

export async function updateTask(id: string, text: string) {
  const task = await prisma.task.update({
    where: { id },
    data: { text },
  });
  revalidatePath('/');
  return task;
}

export async function updateRemarks(id: string, remarks: string) {
  const task = await prisma.task.update({
    where: { id },
    data: { remarks },
  });
  revalidatePath('/');
  return task;
}

export async function deleteTask(id: string) {
  await prisma.task.delete({
    where: { id },
  });
  revalidatePath('/');
}
