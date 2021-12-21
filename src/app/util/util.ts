// Вычислите расстояние между двумя точками, чтобы определить, находится ли точка a в круге b
// ax Координата X точки a
// ay Координата Y точки a
// bx Координата x центра окружности b
// by Координата y центра окружности b
// br Радиус круга b
// return Верно по кругу, иначе ложно
export function calcL (ax: number, ay: number, bx: number, by: number, br: number) {
	return br > Math.sqrt( (ax - bx) * (ax - bx) + (ay - by) * (ay - by) )
}
