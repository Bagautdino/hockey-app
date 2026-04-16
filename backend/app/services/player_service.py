from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.player import Player, Anthropometrics, PhysicalTestSession
from app.models.user import User
from app.repositories import player_repo
from app.schemas.player import PlayerCreate, PlayerUpdate, TestSessionCreate


async def create_player(
    db: AsyncSession, data: PlayerCreate, owner: User
) -> Player:
    """Create a new player with anthropometrics."""
    player = Player(
        owner_id=owner.id,
        first_name=data.first_name,
        last_name=data.last_name,
        middle_name=data.middle_name,
        birth_date=data.birth_date,
        position=data.position,
        shooting_hand=data.shooting_hand,
        city=data.city,
        region=data.region,
        team=data.team,
        jersey_number=data.jersey_number,
    )
    if data.anthropometrics is not None:
        anthro = data.anthropometrics
        player.anthropometrics = Anthropometrics(
            height=anthro.height,
            weight=anthro.weight,
            arm_span=anthro.arm_span,
            leg_length=anthro.leg_length,
            torso_length=anthro.torso_length,
            sitting_height=anthro.sitting_height,
            shoulder_width=anthro.shoulder_width,
            shoe_size=anthro.shoe_size,
            body_fat_pct=anthro.body_fat_pct,
        )
    return await player_repo.create_player(db, player)


async def get_player_or_404(db: AsyncSession, player_id: str) -> Player:
    """Get player by ID or raise 404."""
    player = await player_repo.get_player_by_id(db, player_id)
    if not player:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Игрок не найден",
        )
    return player


def assert_owner(player: Player, user: User) -> None:
    """Verify the user owns the player, else 403."""
    if player.owner_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Нет доступа к этому игроку",
        )


async def update_player(
    db: AsyncSession, player: Player, data: PlayerUpdate
) -> Player:
    """Apply partial updates to a player."""
    update_data = data.model_dump(exclude_unset=True, exclude={"anthropometrics"})
    for key, value in update_data.items():
        setattr(player, key, value)

    if data.anthropometrics is not None:
        anthro = data.anthropometrics
        if player.anthropometrics:
            for key, value in anthro.model_dump().items():
                setattr(player.anthropometrics, key, value)
        else:
            player.anthropometrics = Anthropometrics(**anthro.model_dump())

    return await player_repo.update_player(db, player)


async def add_test_session(
    db: AsyncSession, player_id: str, data: TestSessionCreate
) -> PhysicalTestSession:
    """Add a physical test session for a player."""
    session = PhysicalTestSession(
        player_id=player_id, **data.model_dump(exclude_unset=True)
    )
    return await player_repo.create_test_session(db, session)
