
import * as React from "react"

// Toast store/types
type ToastActionElement = React.ReactElement<any>
type VariantType = "default" | "destructive" | "success" | "warning"

export interface ToasterToast {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
  open: boolean
  type?: VariantType
  onOpenChange?: (open: boolean) => void
}

const TOAST_LIMIT = 5

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0
function genId() {
  count = (count + 1) % Number.MAX_VALUE
  return count.toString()
}

type ActionType = {
  type: typeof actionTypes[keyof typeof actionTypes]
  toast: ToasterToast
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

function toastReducer(state: ToasterToast[], action: ActionType): ToasterToast[] {
  switch (action.type) {
    case actionTypes.ADD_TOAST:
      return [action.toast, ...state].slice(0, TOAST_LIMIT)
    case actionTypes.UPDATE_TOAST:
      return state.map((t) => (t.id === action.toast.id ? { ...t, ...action.toast } : t))
    case actionTypes.DISMISS_TOAST: {
      const { id } = action.toast
      if (toastTimeouts.has(id)) {
        clearTimeout(toastTimeouts.get(id))
        toastTimeouts.delete(id)
      }
      return state.map((t) => (t.id === id ? { ...t, open: false } : t))
    }
    case actionTypes.REMOVE_TOAST:
      if (toastTimeouts.has(action.toast.id)) {
        clearTimeout(toastTimeouts.get(action.toast.id))
        toastTimeouts.delete(action.toast.id)
      }
      return state.filter((t) => t.id !== action.toast.id)
    default:
      return state
  }
}

const listeners: Array<(state: ToasterToast[]) => void> = []
let memoryState: ToasterToast[] = []

function dispatch(action: ActionType) {
  memoryState = toastReducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

interface ToastOpts extends Omit<ToasterToast, "id"> {
  id?: string
  onOpenChange?: (open: boolean) => void
}

function toast({ ...props }: ToastOpts) {
  const id = props.id || genId()

  const update = (props: ToastOpts) =>
    dispatch({ type: actionTypes.UPDATE_TOAST, toast: { ...props, id } })

  const dismiss = () =>
    dispatch({ type: actionTypes.DISMISS_TOAST, toast: { id } as ToasterToast })

  dispatch({
    type: actionTypes.ADD_TOAST,
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open: boolean) => {
        if (!open) dismiss()
        props.onOpenChange?.(open)
      },
    },
  })

  return { id, dismiss, update }
}

function useToast() {
  const [state, setState] = React.useState<ToasterToast[]>(memoryState)
  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) listeners.splice(index, 1)
    }
  }, [state])
  return {
    toasts: state,
    toast,
    dismiss: (toastId?: string) => {
      if (toastId) {
        dispatch({
          type: actionTypes.DISMISS_TOAST,
          toast: { id: toastId } as ToasterToast,
        })
      }
    },
  }
}

export type { ToastActionElement, VariantType, ToastOpts }
export { useToast, toast }
