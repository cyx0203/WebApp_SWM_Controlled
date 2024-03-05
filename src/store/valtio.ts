import { proxy } from 'valtio'
import { useProxy } from 'valtio/utils'

export const defaultData = {
  activeIndex: 1,
}

const store: any = proxy({...defaultData})

export const getStatus = () => {
  // useProxy是对useSnapshot() 或 store 数据的封装
  return useProxy(store);
}

export function resetStatus() {
  Object.entries(defaultData).forEach(
    ([key, value]) => {
      store[key] = value;
    }
  )
}