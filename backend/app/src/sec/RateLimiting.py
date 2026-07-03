"""
  Author: Zach McFadden
  Date: 7/3/26
  Synopsis: Simple IP Based in memory rate limiter
"""
from limits import RateLimitItemPerMinute
from limits.storage import MemoryStorage
from limits.strategies import FixedWindowRateLimiter
from src.util.LogFactory import LogFactory

class RateLimiter:

    def __init__(self, limit_per_minute: int):
        self.rate_limiter = FixedWindowRateLimiter(MemoryStorage())
        self.limit = RateLimitItemPerMinute(limit_per_minute)

    def rate_limit_by_ip(self, ip: str) -> bool:
        """
        Returns True if request SHOULD BE blocked (rate limited)
        """
        rate_limited = not self.rate_limiter.hit(self.limit, ip)

        if rate_limited:
            LogFactory.MAIN_LOG.warning(f"RATE LIMITING IP {ip}")

        return rate_limited