"""Create game_stats table"""
from alembic import op
import sqlalchemy as sa

revision = "006"
down_revision = "005"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "game_stats",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("player_id", sa.String(36), sa.ForeignKey("players.id"), index=True, nullable=False),
        sa.Column("season", sa.String(20), nullable=False),
        sa.Column("competition_name", sa.String(200), nullable=True),
        sa.Column("games_played", sa.Integer(), server_default="0", nullable=False),
        sa.Column("goals", sa.Integer(), nullable=True),
        sa.Column("assists", sa.Integer(), nullable=True),
        sa.Column("points", sa.Integer(), nullable=True),
        sa.Column("plus_minus", sa.Integer(), nullable=True),
        sa.Column("penalty_minutes", sa.Integer(), nullable=True),
        sa.Column("goals_against_avg", sa.Float(), nullable=True),
        sa.Column("save_pct", sa.Float(), nullable=True),
        sa.Column("shutouts", sa.Integer(), nullable=True),
        sa.Column("recorded_at", sa.Date(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("game_stats")
