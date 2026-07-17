// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'quote_item.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;
/// @nodoc
mixin _$QuoteItem {

 String get id; String get name; double get materialCost; double get estimatedHours;
/// Create a copy of QuoteItem
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$QuoteItemCopyWith<QuoteItem> get copyWith => _$QuoteItemCopyWithImpl<QuoteItem>(this as QuoteItem, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is QuoteItem&&(identical(other.id, id) || other.id == id)&&(identical(other.name, name) || other.name == name)&&(identical(other.materialCost, materialCost) || other.materialCost == materialCost)&&(identical(other.estimatedHours, estimatedHours) || other.estimatedHours == estimatedHours));
}


@override
int get hashCode => Object.hash(runtimeType,id,name,materialCost,estimatedHours);

@override
String toString() {
  return 'QuoteItem(id: $id, name: $name, materialCost: $materialCost, estimatedHours: $estimatedHours)';
}


}

/// @nodoc
abstract mixin class $QuoteItemCopyWith<$Res>  {
  factory $QuoteItemCopyWith(QuoteItem value, $Res Function(QuoteItem) _then) = _$QuoteItemCopyWithImpl;
@useResult
$Res call({
 String id, String name, double materialCost, double estimatedHours
});




}
/// @nodoc
class _$QuoteItemCopyWithImpl<$Res>
    implements $QuoteItemCopyWith<$Res> {
  _$QuoteItemCopyWithImpl(this._self, this._then);

  final QuoteItem _self;
  final $Res Function(QuoteItem) _then;

/// Create a copy of QuoteItem
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? name = null,Object? materialCost = null,Object? estimatedHours = null,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,materialCost: null == materialCost ? _self.materialCost : materialCost // ignore: cast_nullable_to_non_nullable
as double,estimatedHours: null == estimatedHours ? _self.estimatedHours : estimatedHours // ignore: cast_nullable_to_non_nullable
as double,
  ));
}

}


/// Adds pattern-matching-related methods to [QuoteItem].
extension QuoteItemPatterns on QuoteItem {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _QuoteItem value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _QuoteItem() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _QuoteItem value)  $default,){
final _that = this;
switch (_that) {
case _QuoteItem():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _QuoteItem value)?  $default,){
final _that = this;
switch (_that) {
case _QuoteItem() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String name,  double materialCost,  double estimatedHours)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _QuoteItem() when $default != null:
return $default(_that.id,_that.name,_that.materialCost,_that.estimatedHours);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String name,  double materialCost,  double estimatedHours)  $default,) {final _that = this;
switch (_that) {
case _QuoteItem():
return $default(_that.id,_that.name,_that.materialCost,_that.estimatedHours);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String name,  double materialCost,  double estimatedHours)?  $default,) {final _that = this;
switch (_that) {
case _QuoteItem() when $default != null:
return $default(_that.id,_that.name,_that.materialCost,_that.estimatedHours);case _:
  return null;

}
}

}

/// @nodoc


class _QuoteItem implements QuoteItem {
  const _QuoteItem({required this.id, required this.name, required this.materialCost, required this.estimatedHours});
  

@override final  String id;
@override final  String name;
@override final  double materialCost;
@override final  double estimatedHours;

/// Create a copy of QuoteItem
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$QuoteItemCopyWith<_QuoteItem> get copyWith => __$QuoteItemCopyWithImpl<_QuoteItem>(this, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _QuoteItem&&(identical(other.id, id) || other.id == id)&&(identical(other.name, name) || other.name == name)&&(identical(other.materialCost, materialCost) || other.materialCost == materialCost)&&(identical(other.estimatedHours, estimatedHours) || other.estimatedHours == estimatedHours));
}


@override
int get hashCode => Object.hash(runtimeType,id,name,materialCost,estimatedHours);

@override
String toString() {
  return 'QuoteItem(id: $id, name: $name, materialCost: $materialCost, estimatedHours: $estimatedHours)';
}


}

/// @nodoc
abstract mixin class _$QuoteItemCopyWith<$Res> implements $QuoteItemCopyWith<$Res> {
  factory _$QuoteItemCopyWith(_QuoteItem value, $Res Function(_QuoteItem) _then) = __$QuoteItemCopyWithImpl;
@override @useResult
$Res call({
 String id, String name, double materialCost, double estimatedHours
});




}
/// @nodoc
class __$QuoteItemCopyWithImpl<$Res>
    implements _$QuoteItemCopyWith<$Res> {
  __$QuoteItemCopyWithImpl(this._self, this._then);

  final _QuoteItem _self;
  final $Res Function(_QuoteItem) _then;

/// Create a copy of QuoteItem
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? name = null,Object? materialCost = null,Object? estimatedHours = null,}) {
  return _then(_QuoteItem(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,materialCost: null == materialCost ? _self.materialCost : materialCost // ignore: cast_nullable_to_non_nullable
as double,estimatedHours: null == estimatedHours ? _self.estimatedHours : estimatedHours // ignore: cast_nullable_to_non_nullable
as double,
  ));
}


}

// dart format on
