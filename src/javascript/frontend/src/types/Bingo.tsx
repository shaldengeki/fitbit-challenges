import User, {emptyUser} from './User'

export type BingoTile = {
    id: number
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

export const emptyBingoCard: BingoCard = {
    user: emptyUser,
    rows: 0,
    columns: 0,
    tiles: []
}

export default BingoCard;
