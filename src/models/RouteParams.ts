type RouteParams = {
  CabeProcess: {
    id: string;
  };
  CabeSave: {
    cabeId?: string;
  };
  FinalizedCabeView: {
    cabeId: string;
  };
};

export default RouteParams;
