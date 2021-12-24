export interface PatternLockGridConfigModel {
	width: number; // ширина canvas
	height: number; // высота canvas
	rows: number; // количество строк сетки
	columns: number; // количество колонок сетки
	bgColor: string; // цвет фона canvas
	lineColor: string; // цвет линий
	lineWidth: number; // толщина линий
	errorColor: string; // цвет для отображения состояния ошибки
}

export type InputPatternLockGridConfigModel = Partial<PatternLockGridConfigModel>;
