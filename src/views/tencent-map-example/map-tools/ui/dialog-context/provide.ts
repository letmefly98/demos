import type { InjectionKey } from 'vue'

const MapDialogKey = 'map-dialog-inject'

export interface MapDialogProvide {
  mapIns: TMap.Map
  dialogRef: TMap.InfoWindow
}

export const MapDialogInjectionKey: InjectionKey<MapDialogProvide> = Symbol(MapDialogKey)
