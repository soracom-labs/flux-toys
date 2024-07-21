export interface HarvestRecord {
  time: number;
  content: any;
  contentType: string;
}

export interface ParsedHarvestRecord {
  time: number;
  content: any;
}

export interface HarvestDecoratorResult {
  resource_id: string;
  resource_type: string;
  from_unixtime: number;
  data: ParsedHarvestRecord[];
  num_records: number;
}
