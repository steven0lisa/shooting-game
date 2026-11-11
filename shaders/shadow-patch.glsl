// source: bundle var l (inside function qy) — SALTLINE_SHADOW soft-PCF patch
// replaces Three.js ShaderChunk.shadowmap_pars_fragment getShadow() via monkey-patch;
// {{...}} are runtime values: frustum metres, depth range, tap counts (taps=16/10, searchTaps=8).
	// SALTLINE_SHADOW
	const vec2 SL_FRUSTUM = vec2( {{SL_FRUSTUM.x metres}}, {{SL_FRUSTUM.y metres}} );   // metres across the shadow map
	const float SL_DEPTH = {{SL_DEPTH metres}};                                       // metres across the depth range
	float slIGN( vec2 p ) { return fract( 52.9829189 * fract( dot( p, vec2( 0.06711056, 0.00583715 ) ) ) ); }
	vec2 slVogel( int i, int n, float phi ) {
		float r = sqrt( ( float( i ) + 0.5 ) / float( n ) );
		float th = float( i ) * 2.39996323 + phi;
		return r * vec2( cos( th ), sin( th ) );
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		shadowCoord.xyz /= shadowCoord.w;
		vec3 sc = shadowCoord.xyz;
		vec3 dx = dFdx( sc ), dy = dFdy( sc );
		bool inFrustum = sc.x >= 0.0 && sc.x <= 1.0 && sc.y >= 0.0 && sc.y <= 1.0;
		if ( ! ( inFrustum && sc.z <= 1.0 ) ) return 1.0;
		// receiver plane depth bias: depth gradient of the receiver in shadow-map uv space
		float det = dx.x * dy.y - dx.y * dy.x;
		vec2 dz = vec2( 0.0 );
		if ( abs( det ) > 1e-12 ) dz = vec2( dy.y * dx.z - dx.y * dy.z, dx.x * dy.z - dy.x * dx.z ) / det;
		vec2 texel = 1.0 / shadowMapSize;
		float maxSlope = 0.0030 / max( texel.x, texel.y );      // never bias more than ~0.6 m per kernel
		dz = clamp( dz, vec2( - maxSlope ), vec2( maxSlope ) );
		float zr = sc.z + shadowBias - ( abs( dz.x ) * texel.x + abs( dz.y ) * texel.y ) * 0.35;
		float phi = slIGN( gl_FragCoord.xy ) * 6.2831853;
		// --- blocker search ---
		vec2 searchR = ( 0.55 * shadowRadius ) / SL_FRUSTUM;     // metres -> uv
		float blk = 0.0, nb = 0.0;
		for ( int i = 0; i < {{SEARCH_TAPS}}; i ++ ) {
			vec2 o = slVogel( i, {{SEARCH_TAPS}}, phi ) * searchR;
			float d = unpackRGBAToDepth( texture2D( shadowMap, sc.xy + o ) );
			float z = zr + dot( o, dz );
			if ( d < z ) { blk += d; nb += 1.0; }
		}
		if ( nb < 0.5 ) return 1.0;
		float avg = blk / nb;
		// --- penumbra: grows with blocker distance (sun half-angle scaled up for look) ---
		float distM = max( zr - avg, 0.0 ) * SL_DEPTH;
		float penM = clamp( distM * 0.022 * shadowRadius, 0.012 * shadowRadius, 0.60 * shadowRadius );
		vec2 filtR = max( vec2( penM ) / SL_FRUSTUM, texel * 1.25 );
		float lit = 0.0;
		for ( int i = 0; i < {{TAPS}}; i ++ ) {
			vec2 o = slVogel( i, {{TAPS}}, phi + 1.7 ) * filtR;
			float d = unpackRGBAToDepth( texture2D( shadowMap, sc.xy + o ) );
			lit += step( zr + dot( o, dz ), d );
		}
		lit /= float( {{TAPS}} );
		// fade to lit at the very edge of the map so the frustum border never shows
		vec2 e = min( sc.xy, 1.0 - sc.xy );
		lit = mix( 1.0, lit, smoothstep( 0.0, 0.02, min( e.x, e.y ) ) );
		return mix( 1.0, lit, shadowIntensity );
	}

	
