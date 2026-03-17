export interface ScrollOptions {
  step?: boolean
  defaultPlace?: number
  callback?: (result: ScrollResult) => void
}

export interface ScrollResult {
  index: number
  node: NodeListOf<ChildNode>
}

export type ScrollCallback = (result: ScrollResult) => void
