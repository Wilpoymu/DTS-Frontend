// Utilidades para asociar loads a waterfalls en localStorage

export function associateLoadToWaterfall(loadId, waterfallId) {
  const key = 'loadWaterfallAssociations';
  const associations = JSON.parse(localStorage.getItem(key) || '{}');
  associations[loadId] = waterfallId;
  localStorage.setItem(key, JSON.stringify(associations));
}

export function getAssociatedWaterfallId(loadId) {
  const key = 'loadWaterfallAssociations';
  const associations = JSON.parse(localStorage.getItem(key) || '{}');
  return associations[loadId] || null;
}

export function autoAssociateLoad(load, waterfalls) {
  const match = waterfalls.find(
    wf =>
      wf.lane &&
      wf.lane.originZip === load.originZip &&
      wf.lane.destinationZip === load.destinationZip
  );
  if (match) {
    associateLoadToWaterfall(load.id, match.lane.id);
    return match.lane.id;
  }
  return null;
} 