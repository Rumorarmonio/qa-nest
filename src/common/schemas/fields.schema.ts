import { z } from 'zod'

export const nameFieldSchema = z.string().trim().min(1).max(120)

export const emailFieldSchema = z.email()

export const passwordFieldSchema = z.string().min(8).max(128)

export const loginPasswordFieldSchema = z.string().min(1).max(128)

export const nonEmptyTrimmedStringSchema = z.string().trim().min(1)
export const nonEmptyString = z.string().min(1)

// возможно, у полей будут разные ограничения в будущем, поэтому здесь несколько отдельных полей
export const titleFieldSchema = nonEmptyTrimmedStringSchema
export const questionTextFieldSchema = nonEmptyTrimmedStringSchema
export const answerTextFieldSchema = nonEmptyTrimmedStringSchema
