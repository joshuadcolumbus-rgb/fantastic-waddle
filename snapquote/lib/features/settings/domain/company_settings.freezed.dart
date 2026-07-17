// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'company_settings.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;
/// @nodoc
mixin _$CompanySettings {

/// Fully-burdened labor rate charged per hour, in dollars.
 double get hourlyRate;/// Flat overhead fee applied to every job, in dollars.
 double get overheadFee;/// Target gross margin as a percentage (e.g. 40 means 40%).
 double get targetMargin;
/// Create a copy of CompanySettings
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$CompanySettingsCopyWith<CompanySettings> get copyWith => _$CompanySettingsCopyWithImpl<CompanySettings>(this as CompanySettings, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is CompanySettings&&(identical(other.hourlyRate, hourlyRate) || other.hourlyRate == hourlyRate)&&(identical(other.overheadFee, overheadFee) || other.overheadFee == overheadFee)&&(identical(other.targetMargin, targetMargin) || other.targetMargin == targetMargin));
}


@override
int get hashCode => Object.hash(runtimeType,hourlyRate,overheadFee,targetMargin);

@override
String toString() {
  return 'CompanySettings(hourlyRate: $hourlyRate, overheadFee: $overheadFee, targetMargin: $targetMargin)';
}


}

/// @nodoc
abstract mixin class $CompanySettingsCopyWith<$Res>  {
  factory $CompanySettingsCopyWith(CompanySettings value, $Res Function(CompanySettings) _then) = _$CompanySettingsCopyWithImpl;
@useResult
$Res call({
 double hourlyRate, double overheadFee, double targetMargin
});




}
/// @nodoc
class _$CompanySettingsCopyWithImpl<$Res>
    implements $CompanySettingsCopyWith<$Res> {
  _$CompanySettingsCopyWithImpl(this._self, this._then);

  final CompanySettings _self;
  final $Res Function(CompanySettings) _then;

/// Create a copy of CompanySettings
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? hourlyRate = null,Object? overheadFee = null,Object? targetMargin = null,}) {
  return _then(_self.copyWith(
hourlyRate: null == hourlyRate ? _self.hourlyRate : hourlyRate // ignore: cast_nullable_to_non_nullable
as double,overheadFee: null == overheadFee ? _self.overheadFee : overheadFee // ignore: cast_nullable_to_non_nullable
as double,targetMargin: null == targetMargin ? _self.targetMargin : targetMargin // ignore: cast_nullable_to_non_nullable
as double,
  ));
}

}


/// Adds pattern-matching-related methods to [CompanySettings].
extension CompanySettingsPatterns on CompanySettings {
/// A variant of `map` that fallback to returning `orElse`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _CompanySettings value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _CompanySettings() when $default != null:
return $default(_that);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// Callbacks receives the raw object, upcasted.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case final Subclass2 value:
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _CompanySettings value)  $default,){
final _that = this;
switch (_that) {
case _CompanySettings():
return $default(_that);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `map` that fallback to returning `null`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _CompanySettings value)?  $default,){
final _that = this;
switch (_that) {
case _CompanySettings() when $default != null:
return $default(_that);case _:
  return null;

}
}
/// A variant of `when` that fallback to an `orElse` callback.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( double hourlyRate,  double overheadFee,  double targetMargin)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _CompanySettings() when $default != null:
return $default(_that.hourlyRate,_that.overheadFee,_that.targetMargin);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// As opposed to `map`, this offers destructuring.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case Subclass2(:final field2):
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( double hourlyRate,  double overheadFee,  double targetMargin)  $default,) {final _that = this;
switch (_that) {
case _CompanySettings():
return $default(_that.hourlyRate,_that.overheadFee,_that.targetMargin);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `when` that fallback to returning `null`
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( double hourlyRate,  double overheadFee,  double targetMargin)?  $default,) {final _that = this;
switch (_that) {
case _CompanySettings() when $default != null:
return $default(_that.hourlyRate,_that.overheadFee,_that.targetMargin);case _:
  return null;

}
}

}

/// @nodoc


class _CompanySettings implements CompanySettings {
  const _CompanySettings({required this.hourlyRate, required this.overheadFee, required this.targetMargin});
  

/// Fully-burdened labor rate charged per hour, in dollars.
@override final  double hourlyRate;
/// Flat overhead fee applied to every job, in dollars.
@override final  double overheadFee;
/// Target gross margin as a percentage (e.g. 40 means 40%).
@override final  double targetMargin;

/// Create a copy of CompanySettings
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$CompanySettingsCopyWith<_CompanySettings> get copyWith => __$CompanySettingsCopyWithImpl<_CompanySettings>(this, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _CompanySettings&&(identical(other.hourlyRate, hourlyRate) || other.hourlyRate == hourlyRate)&&(identical(other.overheadFee, overheadFee) || other.overheadFee == overheadFee)&&(identical(other.targetMargin, targetMargin) || other.targetMargin == targetMargin));
}


@override
int get hashCode => Object.hash(runtimeType,hourlyRate,overheadFee,targetMargin);

@override
String toString() {
  return 'CompanySettings(hourlyRate: $hourlyRate, overheadFee: $overheadFee, targetMargin: $targetMargin)';
}


}

/// @nodoc
abstract mixin class _$CompanySettingsCopyWith<$Res> implements $CompanySettingsCopyWith<$Res> {
  factory _$CompanySettingsCopyWith(_CompanySettings value, $Res Function(_CompanySettings) _then) = __$CompanySettingsCopyWithImpl;
@override @useResult
$Res call({
 double hourlyRate, double overheadFee, double targetMargin
});




}
/// @nodoc
class __$CompanySettingsCopyWithImpl<$Res>
    implements _$CompanySettingsCopyWith<$Res> {
  __$CompanySettingsCopyWithImpl(this._self, this._then);

  final _CompanySettings _self;
  final $Res Function(_CompanySettings) _then;

/// Create a copy of CompanySettings
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? hourlyRate = null,Object? overheadFee = null,Object? targetMargin = null,}) {
  return _then(_CompanySettings(
hourlyRate: null == hourlyRate ? _self.hourlyRate : hourlyRate // ignore: cast_nullable_to_non_nullable
as double,overheadFee: null == overheadFee ? _self.overheadFee : overheadFee // ignore: cast_nullable_to_non_nullable
as double,targetMargin: null == targetMargin ? _self.targetMargin : targetMargin // ignore: cast_nullable_to_non_nullable
as double,
  ));
}


}

// dart format on
