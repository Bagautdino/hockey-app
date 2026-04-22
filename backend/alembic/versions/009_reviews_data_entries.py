"""Create reviews and data_entries tables"""
from alembic import op
import sqlalchemy as sa

revision = "009"
down_revision = "008"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "reviews",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("player_id", sa.String(36), sa.ForeignKey("players.id"), index=True, nullable=False),
        sa.Column("author_id", sa.String(36), sa.ForeignKey("users.id"), index=True, nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("author_role", sa.String(20), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )
    op.create_table(
        "data_entries",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("player_id", sa.String(36), sa.ForeignKey("players.id"), index=True, nullable=False),
        sa.Column("entered_by_id", sa.String(36), sa.ForeignKey("users.id"), index=True, nullable=False),
        sa.Column("entry_type", sa.String(50), nullable=False),
        sa.Column("entry_id", sa.String(36), nullable=False),
        sa.Column("entered_by_role", sa.String(20), nullable=False),
        sa.Column("verified_by_id", sa.String(36), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("verified_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("data_entries")
    op.drop_table("reviews")
