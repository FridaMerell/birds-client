type Observation = {
  event: {
    startDate: string;
    endDate: string;
  };
  identification: {
    verified: boolean;
    uncertainIdentification: boolean;
  };
  location: {
    coordinateUncertaintyInMeters: number;
    county: {
      featureId: string;
      name: string;
    };
    municipality: {
      featureId: string;
      name: string;
    };
    decimalLatitude: number;
    decimalLongitude: number;
    sweref99TmX: number;
    sweref99TmY: number;
  };
  occurrence: {
    occurrenceId: string;
    occurrenceStatus: VocabularyValue<'occurrenceStatus'>;
    recordedBy: string;
  };
  taxon: {
    attributes: {
      organismGroup: string;
    };
    id: number;
    scientificName: string;
    vernacularName: string;
  };
  datasetName: string;
};

type VocabularyValue<T> = {
  id: number;
  value: string;
};

export type { Observation };