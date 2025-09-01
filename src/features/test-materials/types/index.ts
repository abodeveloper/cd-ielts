export interface Test {
  id: number;
  title: string;
  test_type: string;
  test_number: string;
  date: string;
  materials: TestSection[];
}

export interface TestSection {
  id: number;
  title: string;
  test_type: string;
  materials: Material[];
}

export interface Material {
  id: number;
  type: string;
  title: string;
}
