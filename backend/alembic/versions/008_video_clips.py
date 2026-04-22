"""Create video_clips table"""
from alembic import op
import sqlalchemy as sa

revision = "008"
down_revision = "007"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "video_clips",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("player_id", sa.String(36), sa.ForeignKey("players.id"), index=True, nullable=False),
        sa.Column("uploader_id", sa.String(36), sa.ForeignKey("users.id"), index=True, nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("s3_key", sa.String(500), nullable=True),
        sa.Column("video_url", sa.String(1000), nullable=True),
        sa.Column("category", sa.String(50), nullable=False),
        sa.Column("position_type", sa.String(20), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("uploaded_at", sa.DateTime(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("video_clips")
