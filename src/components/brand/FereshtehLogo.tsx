import React, { useId } from 'react';

interface FereshtehLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  variant?: 'full' | 'mark-only';
}

export const FereshtehLogo: React.FC<FereshtehLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = true,
  variant = 'full',
}) => {
  const gradientId = `fereshtehGold${useId().replace(/:/g, '')}`;

  const sizeMap = {
    sm: { icon: 34, title: 'text-base', sub: 'text-[10px]' },
    md: { icon: 42, title: 'text-xl', sub: 'text-xs' },
    lg: { icon: 54, title: 'text-2xl', sub: 'text-sm' },
    xl: { icon: 68, title: 'text-3xl', sub: 'text-base' },
  };

  const currentSize = sizeMap[size];

  return (
    <div
      className={`inline-flex items-center gap-3 select-none ${className}`}
      id="fereshteh-brand-logo"
    >
      {/* Official Fereshteh Coin logo — vector traced from the supplied brand artwork */}
      <div className="relative flex items-center justify-center shrink-0">
        <svg
          width={currentSize.icon}
          height={currentSize.icon}
          viewBox="0 0 517 617"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid meet"
          className="drop-shadow-[0_2px_12px_rgba(255,195,0,0.35)]"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <linearGradient
              id={gradientId}
              x1="0"
              y1="0"
              x2="517"
              y2="617"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#FFE37A" />
              <stop offset="45%" stopColor="#F6C84C" />
              <stop offset="100%" stopColor="#C99020" />
            </linearGradient>
          </defs>

          <path
            d="M 139 496 L 146 515 L 160 544 L 163 554 L 165 570 L 166 571 L 166 578 L 167 579 L 167 592 L 164 599 L 160 604 L 160 608 L 166 608 L 174 604 L 179 599 L 181 595 L 183 586 L 183 573 L 191 561 L 192 552 L 189 546 L 180 540 L 174 534 L 171 527 L 165 504 L 160 501 L 151 500 L 148 498 Z M 92 466 L 87 465 L 70 504 L 59 534 L 45 558 L 35 579 L 27 588 L 23 591 L 19 592 L 17 594 L 17 597 L 22 599 L 36 598 L 43 594 L 59 578 L 73 571 L 77 567 L 78 557 L 75 546 L 76 537 L 92 511 L 112 482 L 111 480 Z M 437 432 L 421 432 L 418 433 L 405 445 L 382 462 L 365 472 L 341 483 L 312 492 L 297 495 L 280 496 L 279 497 L 263 497 L 261 499 L 262 506 L 264 510 L 295 509 L 320 504 L 342 497 L 345 495 L 348 495 L 370 485 L 398 468 L 425 446 Z M 358 347 L 370 363 L 384 378 L 396 386 L 398 386 Z M 302 326 L 304 337 L 315 362 L 323 374 L 333 384 L 341 389 L 316 355 Z M 78 245 L 79 249 L 91 262 L 107 268 L 122 269 L 127 271 L 139 285 L 142 291 L 160 315 L 173 328 L 181 334 L 186 336 L 196 335 L 205 326 L 213 315 L 213 308 L 208 295 L 205 280 L 200 288 L 194 302 L 191 306 L 191 308 L 188 311 L 166 294 L 148 276 L 137 262 L 128 253 L 118 249 L 103 249 L 100 251 L 102 254 L 112 255 L 114 257 L 110 260 L 106 260 L 101 258 L 95 252 L 91 244 L 89 244 L 89 248 L 92 254 L 91 255 L 81 245 Z M 241 252 L 242 253 L 259 238 L 254 238 L 253 239 L 242 238 Z M 456 422 L 437 410 L 427 399 L 421 390 L 409 364 L 407 354 L 405 351 L 403 343 L 394 326 L 389 320 L 380 312 L 368 305 L 352 300 L 341 300 L 367 310 L 377 317 L 385 325 L 391 333 L 397 345 L 404 368 L 413 389 L 422 403 L 432 413 L 431 414 L 417 414 L 416 415 L 394 414 L 383 410 L 373 401 L 353 359 L 344 337 L 336 324 L 329 309 L 322 282 L 321 274 L 317 264 L 317 261 L 315 258 L 314 252 L 304 236 L 288 221 L 239 263 L 236 261 L 236 243 L 237 242 L 237 236 L 236 236 L 222 255 L 214 271 L 214 287 L 221 308 L 227 338 L 226 351 L 222 359 L 214 364 L 207 366 L 191 367 L 190 368 L 150 369 L 149 370 L 142 370 L 133 372 L 125 376 L 116 384 L 106 399 L 85 440 L 83 446 L 80 450 L 80 452 L 93 457 L 117 475 L 138 487 L 151 491 L 156 491 L 160 493 L 173 495 L 189 502 L 210 516 L 224 522 L 228 522 L 233 524 L 241 524 L 242 525 L 258 525 L 254 509 L 252 486 L 251 485 L 251 473 L 254 462 L 263 450 L 291 429 L 297 419 L 299 412 L 298 384 L 293 369 L 286 354 L 282 340 L 283 319 L 288 303 L 291 298 L 291 292 L 287 282 L 287 277 L 288 276 L 293 284 L 293 286 L 315 332 L 320 339 L 331 360 L 352 393 L 370 415 L 376 420 L 388 424 L 456 423 Z M 163 416 L 171 429 L 186 448 L 200 461 L 213 469 L 216 472 L 215 473 L 208 471 L 199 466 L 185 454 L 173 439 L 162 418 Z M 161 415 L 162 414 L 163 415 L 162 416 Z M 135 411 L 136 412 L 137 428 L 140 440 L 140 445 L 144 459 L 148 467 L 147 470 L 140 461 L 135 449 L 134 432 L 133 431 L 133 413 Z M 282 207 L 280 206 L 272 212 L 262 216 L 245 217 L 241 229 L 244 232 L 251 233 L 252 232 L 257 232 L 267 228 L 284 216 Z M 318 199 L 313 201 L 291 202 L 288 203 L 288 208 L 296 210 L 295 212 L 292 213 L 292 215 L 294 217 L 300 217 L 311 211 L 316 205 Z M 144 196 L 125 196 L 124 197 L 121 208 L 109 238 L 115 233 L 137 205 L 144 198 Z M 91 196 L 90 199 L 94 206 L 97 217 L 103 231 L 104 237 L 106 237 L 110 222 L 113 217 L 113 214 L 119 200 L 119 196 L 110 196 L 109 197 Z M 66 196 L 67 199 L 99 237 L 101 238 L 99 231 L 97 229 L 94 219 L 91 214 L 91 211 L 85 196 Z M 133 177 L 127 191 L 141 191 L 142 192 L 144 191 L 135 178 Z M 89 191 L 89 192 L 121 192 L 118 188 L 112 184 L 105 177 Z M 77 177 L 70 184 L 69 187 L 66 190 L 67 191 L 76 191 L 77 192 L 83 191 Z M 110 176 L 113 180 L 123 188 L 128 178 L 128 176 Z M 81 176 L 87 189 L 99 177 L 98 176 Z M 422 152 L 409 161 L 394 174 L 360 212 L 343 236 L 333 253 L 330 260 L 329 267 L 353 231 L 374 203 L 387 189 L 390 184 Z M 482 148 L 481 148 L 479 175 L 482 181 L 484 191 L 487 198 L 492 221 L 493 240 L 494 241 L 493 286 L 486 321 L 474 355 L 456 388 L 445 403 L 445 404 L 454 409 L 459 408 L 468 396 L 486 363 L 490 351 L 493 346 L 499 327 L 507 288 L 507 272 L 508 271 L 508 252 L 507 251 L 508 248 L 507 247 L 507 230 L 506 229 L 505 216 L 502 206 L 501 197 L 494 174 L 488 159 Z M 319 115 L 314 113 L 307 113 L 299 119 L 288 108 L 280 103 L 274 101 L 260 101 L 244 107 L 239 112 L 232 113 L 226 116 L 219 123 L 217 128 L 217 137 L 220 141 L 220 161 L 210 173 L 210 175 L 212 177 L 216 178 L 218 180 L 217 186 L 219 188 L 219 193 L 222 195 L 222 202 L 224 204 L 230 204 L 236 201 L 249 199 L 252 201 L 253 210 L 255 211 L 267 207 L 279 200 L 281 192 L 281 182 L 288 178 L 296 171 L 300 165 L 305 154 L 310 156 L 320 155 L 327 149 L 330 142 L 329 128 L 323 118 Z M 505 43 L 487 52 L 453 74 L 434 88 L 414 105 L 381 138 L 368 154 L 349 182 L 346 189 L 340 198 L 340 200 L 330 220 L 323 242 L 323 251 L 326 248 L 331 232 L 345 203 L 362 176 L 377 156 L 390 141 L 419 113 L 452 86 L 470 73 L 471 74 L 466 87 L 462 106 L 462 115 L 461 116 L 461 169 L 460 170 L 458 192 L 453 211 L 445 229 L 437 241 L 424 255 L 400 273 L 375 284 L 350 290 L 350 291 L 368 290 L 378 288 L 400 281 L 410 276 L 429 263 L 443 249 L 452 236 L 461 217 L 468 188 L 469 173 L 470 172 L 470 148 L 471 147 L 470 145 L 471 143 L 470 139 L 471 108 L 473 100 L 473 93 L 482 71 L 490 59 Z M 423 70 L 411 60 L 389 45 L 375 37 L 349 25 L 321 16 L 298 11 L 292 11 L 285 9 L 275 9 L 274 8 L 243 8 L 242 9 L 230 9 L 229 10 L 223 10 L 217 12 L 201 14 L 186 18 L 183 20 L 180 20 L 159 28 L 137 39 L 135 41 L 133 41 L 113 54 L 95 68 L 70 93 L 56 111 L 42 132 L 31 153 L 30 158 L 27 162 L 18 187 L 13 207 L 13 212 L 9 231 L 8 280 L 9 281 L 10 297 L 17 329 L 25 352 L 33 368 L 33 370 L 45 391 L 63 416 L 80 434 L 83 430 L 86 421 L 70 402 L 56 382 L 38 347 L 29 320 L 29 316 L 25 302 L 23 279 L 22 278 L 22 240 L 23 239 L 25 217 L 30 195 L 38 171 L 48 150 L 65 122 L 80 103 L 110 74 L 129 60 L 149 48 L 177 36 L 195 30 L 232 23 L 247 23 L 248 22 L 283 23 L 325 32 L 346 39 L 376 54 L 395 66 L 419 85 L 422 84 L 429 77 Z"
            fill={`url(#${gradientId})`}
            fillRule="evenodd"
            clipRule="evenodd"
          />
        </svg>
      </div>

      {/* Existing brand typography stays unchanged */}
      {variant === 'full' && (
        <div className="flex flex-col text-right">
          <span
            className={`font-bold tracking-tight text-white leading-none ${currentSize.title} flex items-center gap-1.5`}
          >
          <span>فرشته</span>
            <span className="text-[#FFD60A]">کوین</span>
            

          </span>

          {showSubtitle && (
            <span
              className={`text-slate-400 font-medium tracking-wider uppercase mt-1 ${currentSize.sub}`}
            >
              Fereshteh Coin
            </span>
          )}
        </div>
      )}
    </div>
  );
};
