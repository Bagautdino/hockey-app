"""Create anthro_snapshots table"""
from alembic import op
import sqlalchemy as sa

revision = "003"
down_revision = "002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "anthro_snapshots",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("player_id", sa.String(36), sa.ForeignKey("players.id"), index=True, nullable=False),
        sa.Column("recorded_at", sa.DateTime(), nullable=False),
        sa.Column("height", sa.Float(), nullable=True),
        sa.Column("weight", sa.Float(), nullable=True),
        sa.Column("body_fat_pct", sa.Float(), nullable=True),
    )


def downgrade() -> None:
    op.drop_table("anthro_snapshots")
