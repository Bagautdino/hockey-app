"""Add category and test_name to physical_test_sessions"""
from alembic import op
import sqlalchemy as sa

revision = "004"
down_revision = "003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("physical_test_sessions", sa.Column("category", sa.String(20), server_default="off_ice", nullable=False))
    op.add_column("physical_test_sessions", sa.Column("test_name", sa.String(200), nullable=True))


def downgrade() -> None:
    op.drop_column("physical_test_sessions", "test_name")
    op.drop_column("physical_test_sessions", "category")
