// Web Worker для тяжелых вычислений
export const createDataProcessingWorker = () => {
  const workerCode = `
    self.onmessage = function(e) {
      const { type, data } = e.data;
      
      switch (type) {
        case 'SORT_CADETS':
          const sortedCadets = data.cadets.sort((a, b) => {
            switch (data.sortBy) {
              case 'name':
                return a.name.localeCompare(b.name);
              case 'score':
                return b.total_score - a.total_score;
              case 'rank':
                return a.rank - b.rank;
              default:
                return 0;
            }
          });
          self.postMessage({ type: 'SORT_CADETS_RESULT', data: sortedCadets });
          break;
          
        case 'FILTER_CADETS':
          const filteredCadets = data.cadets.filter(cadet => {
            const matchesSearch = cadet.name.toLowerCase().includes(data.searchTerm.toLowerCase());
            const matchesPlatoon = data.platoon === 'all' || cadet.platoon === data.platoon;
            const matchesSquad = data.squad === 'all' || cadet.squad.toString() === data.squad;
            return matchesSearch && matchesPlatoon && matchesSquad;
          });
          self.postMessage({ type: 'FILTER_CADETS_RESULT', data: filteredCadets });
          break;
          
        case 'CALCULATE_STATISTICS':
          const stats = {
            totalCadets: data.cadets.length,
            averageScore: data.cadets.reduce((sum, cadet) => sum + cadet.total_score, 0) / data.cadets.length,
            topPerformers: data.cadets.filter(cadet => cadet.rank <= 10),
            platoonStats: data.cadets.reduce((acc, cadet) => {
              if (!acc[cadet.platoon]) {
                acc[cadet.platoon] = { count: 0, totalScore: 0 };
              }
              acc[cadet.platoon].count++;
              acc[cadet.platoon].totalScore += cadet.total_score;
              return acc;
            }, {})
          };
          self.postMessage({ type: 'CALCULATE_STATISTICS_RESULT', data: stats });
          break;
      }
    };
  `;

  const blob = new Blob([workerCode], { type: 'application/javascript' });
  return new Worker(URL.createObjectURL(blob));
};

export const useWebWorker = () => {
  const worker = createDataProcessingWorker();

  const postMessage = (type: string, data: any) => {
    return new Promise((resolve) => {
      const handleMessage = (e: MessageEvent) => {
        if (e.data.type === `${type}_RESULT`) {
          worker.removeEventListener('message', handleMessage);
          resolve(e.data.data);
        }
      };
      
      worker.addEventListener('message', handleMessage);
      worker.postMessage({ type, data });
    });
  };

  const cleanup = () => {
    worker.terminate();
  };

  return { postMessage, cleanup };
};