"""Create injuries table"""
from alembic import op
import sqlalchemy as sa

revision = "005"
down_revision = "004"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "injuries",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("player_id", sa.String(36), sa.ForeignKey("players.id"), index=True, nullable=False),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("injury_date", sa.Date(), nullable=False),
        sa.Column("recovery_days", sa.Integer(), nullable=True),
        sa.Column("status", sa.String(20), server_default="in_progress", nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("injuries")
