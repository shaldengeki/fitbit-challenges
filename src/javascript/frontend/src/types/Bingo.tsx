import User from './User'

export type BingoTile = {
    steps: number
    activeMinutes: number
    distanceKm: number
    coordinateX: number
    coordinateY: number
    flipped: boolean
    requiredForWin: boolean
}

type BingoCard = {
    user: User
    rows: number
    columns: number
    tiles: Array<BingoTile>
}

export default BingoCard;
